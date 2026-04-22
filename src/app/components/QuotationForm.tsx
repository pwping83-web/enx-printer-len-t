import { useState, useEffect } from 'react';
import { Calendar, Building2, User, Phone, Mail, CalendarIcon, Image as ImageIcon, X, Shield, Check, Lock } from 'lucide-react';
import { getPricingConfig, PricingConfig } from '../utils/pricingConfig';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import 'react-day-picker/dist/style.css';
import { sendCustomerInfoEmail } from '../utils/emailNotification';

// Import printer images (using figma:asset scheme)
import img3156 from "figma:asset/b86fc127679546e8c9e7415b9e5293b84e4ad48b.png";
import img1390 from "figma:asset/8c3e603884c656a9735074195aaf4acfd8e8aded.png";
import img3880P800 from "figma:asset/30571dbf01da020d68d481c5660341a737a70f92.png";

/**
 * Quotation Data Interface
 * - Defines the structure of quotation form data
 * - Used for form submission and data storage
 */
export interface QuotationData {
  companyName: string;        // Customer company name
  contactName: string;        // Customer contact person name
  phone: string;              // Customer phone number
  email: string;              // Customer email address
  printerModel: string;       // Selected printer model ID
  printerSize: string;        // Printer size (A2/A3/A4)
  rentalPeriod: number;       // Rental period in months (1, 3, 6, 12)
  quantity: number;           // Number of printers to rent
  startDate: string;          // Rental start date (YYYY-MM-DD)
  includeSoftware: boolean;   // Include printing software (15,000 KRW/month)
  includeInstallationFee: boolean; // Include one-time installation fee
  usage?: string[];           // Printing usage types (macaron, rice cake, cake, other)
  usageOther?: string;        // Custom usage description
  totalPrice?: number;        // Total calculated price
  transactionType?: 'rental' | 'purchase'; // 거래 유형 (렌탈 or 구매)
  printTypes?: string;        // Print types string
  dailyPrintQuantity?: number;// Daily print quantity
  address?: string;           // Installation address
  detailedAddress?: string;   // Detailed address
}

/**
 * Quotation Form Component Props
 */
interface QuotationFormProps {
  initialData?: QuotationData;         // Pre-filled form data (for editing)
  onSubmit?: (data: QuotationData) => void;  // Submit callback
  submitButtonText?: string;            // Custom submit button text
  submitButtonIcon?: React.ReactNode;   // Custom submit button icon
  requireVerification?: boolean;        // Require phone verification (default: true)
}

/**
 * Quotation Form Component
 * - Main customer input form for printer rental quotation
 * - Features: Printer selection, rental period, phone verification, date picker
 * - Supports dynamic pricing configuration from admin settings
 * - Phone verification required before viewing pricing information
 * 
 * Key Features:
 * - 3 printer models: Epson 3156 A4, Epson 1390 A3, Epson 3880/P800 A2
 * - Rental periods: 1, 3, 6, 12 months (with different pricing)
 * - Usage types: Macaron, Rice Cake, Cake, Other (multiple selection)
 * - Phone verification for security
 * - Date picker for rental start date
 * - Image preview for selected printer
 * - Installation fee: 150,000 KRW (A4) or 170,000 KRW (A3, A2)
 * - Optional software: 15,000 KRW/month
 */
export default function QuotationForm({ 
  initialData, 
  onSubmit,
  submitButtonText = '견적서 생성',
  submitButtonIcon,
  requireVerification = true,
}: QuotationFormProps) {
  const [config, setConfig] = useState<PricingConfig>(getPricingConfig());
  const [isPhoneVerified, setIsPhoneVerified] = useState(!requireVerification);
  
  // Listen for pricing configuration updates from admin
  useEffect(() => {
    const handlePricingUpdate = () => {
      setConfig(getPricingConfig());
    };
    
    window.addEventListener('pricingConfigUpdated', handlePricingUpdate);
    return () => {
      window.removeEventListener('pricingConfigUpdated', handlePricingUpdate);
    };
  }, []);

  // Printer models configuration (3 fixed models)
  const printerModels = [
    { 
      id: 'Epson-3156-A4', 
      name: 'Epson 3156 A4', 
      description: '입문용 · 소형',
      pricing: config.models.epson3156A4,
      image: img3156,
      capacity: '5cm 마카롱 9개',
      imageScale: 0.6,         // Small printer: 60% scale
      installationFee: 150000  // Installation fee: 150,000 KRW (lighter)
    },
    { 
      id: 'Epson-1390-A3', 
      name: 'Epson 1390 A3', 
      description: '중급용 · 중형',
      pricing: config.models.epson1390A3,
      image: img3880P800,
      capacity: '5cm 마카롱 40개',
      imageScale: 0.85,        // Medium printer: 85% scale
      installationFee: 170000  // Installation fee: 170,000 KRW
    },
    { 
      id: 'Epson-3880-P800-A2', 
      name: 'Epson 3880/P800 A2', 
      description: '전문가용 · 대형',
      pricing: config.models.epson3880P800A2,
      image: img1390,
      capacity: '5cm 마카롱 50개',
      imageScale: 1.0,         // Large printer: 100% scale
      installationFee: 170000  // Installation fee: 170,000 KRW
    },
  ];

  // Form state initialization
  const [formData, setFormData] = useState<QuotationData>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    printerModel: printerModels[2].id, // Default: Large printer (Epson 3880/P800 A2)
    printerSize: 'A2',
    rentalPeriod: 3,                   // Default: 3 months
    quantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    includeSoftware: false,
    includeInstallationFee: true,
    usage: [],                           // Empty: user must select at least one
    transactionType: 'rental',          // Default: rental
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPrinterImage, setShowPrinterImage] = useState(false);
  
  // Phone verification states
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  // Check if all customer info fields are filled
  const isCustomerInfoComplete = 
    formData.companyName.trim() !== '' && 
    formData.contactName.trim() !== '' && 
    formData.phone.trim() !== '' && 
    formData.email.trim() !== '' &&
    formData.email.includes('@');

  // Check if at least one usage/print type is selected
  const isUsageSelected = (formData.usage && formData.usage.length > 0) || false;

  // Both conditions met = full form unlocked
  const isFullFormUnlocked = isCustomerInfoComplete && isUsageSelected;

  // Track previous state to detect transition from incomplete → complete
  const customerInfoSentRef = useState(false);

  // Send 1st notification email when usage is selected (2nd blind disappears)
  useEffect(() => {
    if (isFullFormUnlocked && !customerInfoSentRef[0]) {
      customerInfoSentRef[1](true);
      sendCustomerInfoEmail({
        companyName: formData.companyName,
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email,
      }).catch((err) => {
        console.error('1차 알림 이메일 전송 실패:', err);
      });
    }
  }, [isFullFormUnlocked]);

  // Korean timezone date handling functions
  // Convert date string to Korean timezone Date object
  const getKoreanDate = (dateString?: string): Date => {
    if (dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day, 9, 0, 0); // UTC+9
    }
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime;
  };

  // Format Date object to YYYY-MM-DD string
  const formatKoreanDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update formData when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    if (formData.transactionType === 'purchase') {
      const purchaseSupplyAmount = PURCHASE_PRICE * formData.quantity;
      onSubmit({
        ...formData,
        includeInstallationFee: false,
        totalPrice: purchaseSupplyAmount,
      });
      return;
    }

    onSubmit({
      ...formData,
      totalPrice: Math.round(grandTotal),
    });
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'rentalPeriod' ? Number(value) : value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Format price to Korean currency format (e.g., 200000 -> "235,000원")
  const formatPriceKorean = (price: number): string => {
    return `${price.toLocaleString()}원`;
  };

  // Calculate price based on model (size is included in the model)
  const selectedModel = printerModels.find((m) => m.id === formData.printerModel);

  // Purchase special price constants (Epson 3156 A4 only)
  const PURCHASE_PRICE = 2000000;
  const purchaseVatAmount = Math.round(PURCHASE_PRICE * 0.1);
  const purchaseTotalWithVat = PURCHASE_PRICE + purchaseVatAmount;
  
  // Calculate monthly rental price based on rental period
  let monthlyPrice = 0;
  if (selectedModel) {
    if (formData.rentalPeriod === 1) {
      // 1개월: 3개월 가격에 35% 할증
      monthlyPrice = Math.round(selectedModel.pricing.threeMonths * (1 + config.surcharges.oneMonth));
    } else if (formData.rentalPeriod >= 12) {
      // 12개월 이상: 12개월 가격
      monthlyPrice = selectedModel.pricing.twelveMonths;
    } else if (formData.rentalPeriod >= 6) {
      // 6~11개월: 6개월 가격
      monthlyPrice = selectedModel.pricing.sixMonths;
    } else {
      // 2~5개월: 3개월 가격
      monthlyPrice = selectedModel.pricing.threeMonths;
    }
  }

  // Total monthly price including software (free event)
  const totalMonthlyPrice = monthlyPrice;

  // Initial installation fee (renewal contract is 0 KRW)
  const installationFee = selectedModel ? selectedModel.installationFee : 170000;
  const appliedInstallationFee = formData.includeInstallationFee ? installationFee : 0;

  // Calculate total rental cost (total monthly price * rental period)
  const totalRentalCost = totalMonthlyPrice * formData.rentalPeriod;
  const grandTotal = totalRentalCost + appliedInstallationFee;
  const vatAmount = Math.round(grandTotal * 0.1);
  const grandTotalWithVat = grandTotal + vatAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ===== 거래 유형 선택 ===== */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">거래 유형</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              transactionType: 'rental',
            }))}
            className={`px-3 py-2.5 border rounded-xl text-left transition-all ${
              formData.transactionType !== 'purchase'
                ? 'border-indigo-500 bg-white shadow-sm ring-1 ring-indigo-200'
                : 'border-gray-200 bg-white/70 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                formData.transactionType !== 'purchase' ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <span className="text-sm">🔄</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm leading-none">렌탈</div>
                <div className="text-[10px] text-gray-500 mt-1">월 렌탈료 방식</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              transactionType: 'purchase',
              printerModel: 'Epson-3156-A4',
              printerSize: 'A4',
            }))}
            className={`px-3 py-2.5 border rounded-xl text-left transition-all relative overflow-hidden ${
              formData.transactionType === 'purchase'
                ? 'border-indigo-500 bg-white shadow-sm ring-1 ring-indigo-200'
                : 'border-gray-200 bg-white/70 hover:border-indigo-300'
            }`}
          >
            <div className="absolute top-1.5 right-1.5 bg-indigo-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
              특가
            </div>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                formData.transactionType === 'purchase' ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <span className="text-sm">🛒</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm leading-none">구매</div>
                <div className="text-[10px] text-gray-500 mt-1">Epson 3156 한정</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Information */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            회사명
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-300 bg-gray-50/50 transition-all"
            placeholder="회사명을 입력하세요"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            담당자명
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-300 bg-gray-50/50 transition-all"
            placeholder="담당자명을 입력하세요"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5" />
            연락처
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-300 bg-gray-50/50 transition-all"
            placeholder="010-0000-0000"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-300 bg-gray-50/50 transition-all"
            placeholder="example@company.com"
          />
        </div>
      </div>

      {/* Stage 1: 인쇄 종류 - 고객정보 입력 완료 시 블라인드 해제 */}
      <div className="relative">
        {/* Blur overlay when customer info is not complete */}
        {!isCustomerInfoComplete && (
          <div className="absolute inset-0 z-20 flex items-start justify-center pt-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 text-center max-w-xs mx-4 sticky top-32">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">고객 정보를 입력해주세요</h4>
              <p className="text-xs text-gray-500">
                회사명, 담당자명, 연락처, 이메일을<br/>모두 입력하시면 인쇄 종류를 선택할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        <div
          className={`transition-all duration-500 ${
            !isCustomerInfoComplete
              ? 'blur-[8px] pointer-events-none select-none'
              : 'blur-0'
          }`}
        >
          <div className="pt-4 border-t border-gray-100">
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                인쇄 종류 <span className="text-xs text-gray-500">(복수 선택 가능)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['마카롱', '떡', '케익', '기타'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData(prev => {
                        const currentUsage = prev.usage || [];
                        if (currentUsage.includes(type)) {
                          return { ...prev, usage: currentUsage.filter(u => u !== type) };
                        } else {
                          return { ...prev, usage: [...currentUsage, type] };
                        }
                      });
                    }}
                    className={`p-3 border-2 rounded-xl text-center transition-all ${
                      formData.usage?.includes(type)
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type}</div>
                  </button>
                ))}
              </div>
              
              {/* 기타 선택 시 텍스트 입력 필드 표시 */}
              {formData.usage?.includes('기타') && (
                <div className="mt-3">
                  <input
                    type="text"
                    name="usageOther"
                    value={formData.usageOther || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageOther: e.target.value }))}
                    placeholder="기타 인쇄 종류를 입력하세요"
                    className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 bg-blue-50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stage 2: 렌탈 정보 이하 전체 - 인쇄 종류 선택 시 블라인드 해제 + 1차 알림 발송 */}
      <div className="relative">
        {/* Blur overlay when usage is not selected */}
        {!isFullFormUnlocked && isCustomerInfoComplete && (
          <div className="absolute inset-0 z-20 flex items-start justify-center pt-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 text-center max-w-xs mx-4 sticky top-32">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">인쇄 종류를 선택해주세요</h4>
              <p className="text-xs text-gray-500">
                인쇄 종류를 1개 이상 선택하시면<br/>렌탈 정보를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        )}
        {!isFullFormUnlocked && !isCustomerInfoComplete && (
          <div className="absolute inset-0 z-20" />
        )}

        <div
          className={`space-y-6 transition-all duration-500 ${
            !isFullFormUnlocked
              ? 'blur-[8px] pointer-events-none select-none'
              : 'blur-0'
          }`}
        >
          {/* ===== 구매 특가 섹션 (Epson 3156 A4 전용) ===== */}
          {formData.transactionType === 'purchase' && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {/* 특가 카드 - 심플 */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded mb-2">판매 특가</span>
                    <h3 className="font-bold text-gray-900">Epson 3156 A4</h3>
                    <p className="text-xs text-gray-500 mt-0.5">식용 프린터 · 입문용 · 소형</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-gray-900">2,000,000원</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">부가세 별도</div>
                  </div>
                </div>
                {/* 1년 무상 AS */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                  <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-gray-700">1년 무상 A/S 포함</span>
                    <span className="text-[11px] text-gray-400 ml-1.5">잉크막힘 제외</span>
                  </div>
                </div>
              </div>

              {/* 프린터 이미지 */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <h4 className="font-medium text-gray-700 text-sm">Epson 3156 A4</h4>
                </div>
                <div className="w-full aspect-square max-w-xs mx-auto bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center p-4 relative">
                  <img src={img3156} alt="Epson 3156 A4" className="object-contain" style={{ maxWidth: '60%', maxHeight: '60%' }} />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80">가로 375mm</div>
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80 -rotate-90">세로 420mm</div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80 rotate-90">높이 340mm</div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">📏 실측 사이즈</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded border border-gray-200"><div className="text-[10px] text-gray-500">가로</div><div className="text-xs font-bold text-gray-700">375mm</div></div>
                    <div className="p-2 bg-white rounded border border-gray-200"><div className="text-[10px] text-gray-500">세로</div><div className="text-xs font-bold text-gray-700">420mm</div></div>
                    <div className="p-2 bg-white rounded border border-gray-200"><div className="text-[10px] text-gray-500">높이</div><div className="text-xs font-bold text-gray-700">340mm</div></div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 px-1">
                  <span>📦</span><span>5cm 마카롱 9개 동시 인쇄</span>
                </div>
              </div>

              {/* 수량 선택 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">구매 수량</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all font-bold text-lg">−</button>
                  <span className="w-12 text-center font-bold text-lg text-gray-900">{formData.quantity}</span>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all font-bold text-lg">+</button>
                  <span className="text-sm text-gray-500 ml-1">대</span>
                </div>
              </div>

              {/* 구매 가격 요약 */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">판매 특가 (단가)</span>
                  <span className="font-medium text-gray-800">{PURCHASE_PRICE.toLocaleString()}원</span>
                </div>
                {formData.quantity > 1 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">수량</span>
                    <span className="font-medium text-gray-800">{formData.quantity}대</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">설치비</span>
                  <span className="text-gray-600">없음</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-800">공급가액</span>
                    <span className="font-bold text-gray-900">{(PURCHASE_PRICE * formData.quantity).toLocaleString()}원</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-2.5 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">부가세 (10%)</span>
                    <span className="text-gray-600">{(purchaseVatAmount * formData.quantity).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 -mx-1 px-3 py-2.5 rounded-lg border border-gray-100">
                    <span className="text-sm font-semibold text-gray-800">부가세 포함 총금액</span>
                    <span className="font-black text-indigo-600">{(purchaseTotalWithVat * formData.quantity).toLocaleString()}원</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>1년 무상 A/S 포함 (잉크막힘 제외)</span>
                </div>
              </div>
            </div>
          )}

          {/* Rental Information */}
          {formData.transactionType !== 'purchase' && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="mb-4 font-semibold text-gray-800">렌탈 정보</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  프린터 모델
                </label>
                <div className="space-y-4">
                  {printerModels.map((model) => (
                    <div key={model.id}>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, printerModel: model.id }))}
                        className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                          formData.printerModel === model.id
                            ? 'border-indigo-600 bg-indigo-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{model.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{model.description}</div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-pink-600 font-semibold">
                              <span>📦</span>
                              <span>{model.capacity}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            formData.printerModel === model.id
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {formData.printerModel === model.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-indigo-600 mt-2">
                          월 {formatPriceKorean(model.pricing.threeMonths)}
                        </div>
                      </button>

                      {/* 선택된 프린터 이미지 표시 - 각 모델 바로 아래 */}
                      {formData.printerModel === model.id && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-semibold text-gray-900 text-sm">{model.name}</h4>
                          </div>
                          <div className="w-full aspect-square max-w-sm mx-auto bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center p-4 relative">
                            <img 
                              src={model.image} 
                              alt={model.name}
                              className="w-full h-full object-contain"
                              style={{ 
                                maxWidth: `${model.imageScale * 100}%`,
                                maxHeight: `${model.imageScale * 100}%`
                              }}
                            />
                            
                            {/* 3156 프린터 사이즈 표시 */}
                            {model.id === 'Epson-3156-A4' && (
                              <>
                                {/* 가로 - 상단 */}
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80">
                                  가로 375mm
                                </div>
                                
                                {/* 세로 - 좌측 */}
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80 -rotate-90">
                                  세로 420mm
                                </div>
                                
                                {/* 높이 - 우측 */}
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80 rotate-90">
                                  높이 340mm
                                </div>
                              </>
                            )}
                            
                            {/* 1390 / P800 프린터 사이즈 표시 */}
                            {(model.id === 'Epson-1390-A3' || model.id === 'Epson-3880-P800-A2') && (
                              <>
                                {/* 가로 - 상단 */}
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80">
                                  가로 670mm
                                </div>
                                
                                {/* 세로 - 좌측 */}
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80 -rotate-90">
                                  세로 700mm
                                </div>
                                
                                {/* 높이 - 우측 */}
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-80 rotate-90">
                                  높이 450mm
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* 3156 프린터 사이즈 정보 텍스트 */}
                          {model.id === 'Epson-3156-A4' && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-300">
                              <div className="text-xs text-gray-600 mb-2 font-semibold">📏 실측 사이즈</div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-red-50 rounded border border-red-200">
                                  <div className="text-[10px] text-red-600 font-semibold">가로</div>
                                  <div className="text-xs font-bold text-red-700">375mm</div>
                                </div>
                                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                  <div className="text-[10px] text-blue-600 font-semibold">세로</div>
                                  <div className="text-xs font-bold text-blue-700">420mm</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded border border-green-200">
                                  <div className="text-[10px] text-green-600 font-semibold">높이</div>
                                  <div className="text-xs font-bold text-green-700">340mm</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* 1390 / P800 프린터 사이즈 정보 텍스트 */}
                          {(model.id === 'Epson-1390-A3' || model.id === 'Epson-3880-P800-A2') && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-300">
                              <div className="text-xs text-gray-600 mb-2 font-semibold">📏 실측 사이즈</div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-red-50 rounded border border-red-200">
                                  <div className="text-[10px] text-red-600 font-semibold">가로</div>
                                  <div className="text-xs font-bold text-red-700">670mm</div>
                                </div>
                                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                  <div className="text-[10px] text-blue-600 font-semibold">세로</div>
                                  <div className="text-xs font-bold text-blue-700">700mm</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded border border-green-200">
                                  <div className="text-[10px] text-green-600 font-semibold">높이</div>
                                  <div className="text-xs font-bold text-green-700">450mm</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  시작일
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-blue-400 transition-colors"
                  >
                    <span className="text-gray-900">
                      {format(getKoreanDate(formData.startDate), 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })}
                    </span>
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {showDatePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDatePicker(false)}
                      ></div>
                      <div className="absolute z-20 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                        <DayPicker
                          mode="single"
                          selected={getKoreanDate(formData.startDate)}
                          onSelect={(date) => {
                            if (date) {
                              const koreanDateString = formatKoreanDate(date);
                              setFormData(prev => ({ ...prev, startDate: koreanDateString }));
                              setShowDatePicker(false);
                            }
                          }}
                          locale={ko}
                          disabled={{ before: new Date() }}
                          className="rdp-custom"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 렌탈 기간 선택 - 간단한 버튼 형식 */}
            <div className="mt-6 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                렌탈 기간 선택
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1개월 */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rentalPeriod: 1 }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    formData.rentalPeriod === 1
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 mb-1">1개월</div>
                  <div className="text-xs text-red-600 font-semibold mb-2">35% 할증</div>
                  <div className="text-sm text-gray-700">
                    월 {formatPriceKorean(selectedModel ? Math.round(selectedModel.pricing.threeMonths * 1.35) : 0)}
                  </div>
                </button>

                {/* 3개월 */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rentalPeriod: 3 }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    formData.rentalPeriod === 3
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 mb-1">3개월</div>
                  <div className="text-xs text-gray-500 font-semibold mb-2">기본</div>
                  <div className="text-sm text-gray-700">
                    월 {formatPriceKorean(selectedModel ? selectedModel.pricing.threeMonths : 0)}
                  </div>
                </button>

                {/* 6개월 */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rentalPeriod: 6 }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    formData.rentalPeriod === 6
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 mb-1">6개월</div>
                  <div className="text-xs text-green-600 font-semibold mb-2">할인가</div>
                  <div className="text-sm text-gray-700">
                    월 {formatPriceKorean(selectedModel ? selectedModel.pricing.sixMonths : 0)}
                  </div>
                </button>

                {/* 12개월 */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rentalPeriod: 12 }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    formData.rentalPeriod === 12
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 mb-1">12개월</div>
                  <div className="text-xs text-green-600 font-semibold mb-2">최저가</div>
                  <div className="text-sm text-gray-700">
                    월 {formatPriceKorean(selectedModel ? selectedModel.pricing.twelveMonths : 0)}
                  </div>
                </button>
              </div>
            </div>

            {/* Software Option */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300 relative">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm">
                무료 이벤트
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="includeSoftware"
                  checked={formData.includeSoftware}
                  onChange={handleCheckboxChange}
                  className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    인쇄 프로그램 포함
                  </div>
                </div>
              </label>
            </div>

            {/* Installation Fee Option */}
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="includeInstallationFee"
                  checked={formData.includeInstallationFee}
                  onChange={handleCheckboxChange}
                  className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    최초 설치비 포함
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    체크 해제 시 설치비는 청구하지 않습니다.
                  </div>
                </div>
              </label>
            </div>

            {/* Price Display */}
            <div className="mt-6 p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-900 font-semibold">
                  <span>월 렌탈료</span>
                  <span className="text-indigo-600">{formatPriceKorean(monthlyPrice)}/월</span>
                </div>

                {formData.rentalPeriod === 1 && (
                  <div className="text-xs text-red-600 text-right">
                    * 1개월 계약은 35% 할증 적용
                  </div>
                )}
                
                {formData.rentalPeriod >= 6 && formData.rentalPeriod < 12 && (
                  <div className="text-xs text-green-600 text-right">
                    * 6개월 이상 계약 할인가 적용
                  </div>
                )}
                
                {formData.rentalPeriod >= 12 && (
                  <div className="text-xs text-green-600 text-right">
                    * 12개월 이상 계약 최저가 적용
                  </div>
                )}

                {formData.includeSoftware && (
                  <div className="flex justify-between items-center text-xs text-gray-700 bg-gray-50 -mx-3 px-3 py-2 rounded">
                    <span className="flex items-center gap-1">
                      인쇄 프로그램 임대
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                        무료
                      </span>
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-700 font-medium">월 렌탈료</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPriceKorean(Math.round(totalMonthlyPrice))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-gray-600">
                      총 {formData.rentalPeriod}개월 렌탈 비용
                    </span>
                    <span className="text-xs font-semibold text-gray-800">
                      {formatPriceKorean(Math.round(totalRentalCost))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-gray-600">
                      최초 설치비
                    </span>
                    <span className="text-xs font-semibold text-gray-800">
                      {formData.includeInstallationFee ? formatPriceKorean(installationFee) : '없음'}
                    </span>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-900 font-bold">최종 결제 금액</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatPriceKorean(Math.round(grandTotal))}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 text-right mt-0.5">부가세 별도 · 인쇄 프로그램 무료</div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-gray-500">부가세 (10%)</span>
                      <span className="text-xs text-gray-600">{formatPriceKorean(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-rose-50 -mx-3 px-3 py-2.5 rounded-lg">
                      <span className="text-xs text-gray-900 font-bold">부가세 포함 총금액</span>
                      <span className="text-lg font-bold text-pink-600">
                        {formatPriceKorean(grandTotalWithVat)}
                      </span>
                    </div>
                  </div>
                </div>

                {formData.rentalPeriod < 6 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-gray-700">
                      💡 <strong>6개월 이상</strong> 렌탈 시 할인가 적용, <strong>12개월</strong> 렌탈 시 최저가 적용!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )} {/* end rental conditional */}

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98]"
          >
            {submitButtonIcon && <span className="mr-2">{submitButtonIcon}</span>}
            {submitButtonText}
          </button>
        </div>
      </div>

      {/* 프린터 이미지 모달 */}
      {showPrinterImage && selectedModel && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowPrinterImage(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedModel.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedModel.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrinterImage(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedModel.image} 
                    alt={selectedModel.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* 인쇄 용량 정보 */}
                <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-sm text-gray-600">인쇄 용량</p>
                      <p className="text-lg font-bold text-pink-600 mt-0.5">
                        {selectedModel.capacity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">월 렌탈료</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {formatPriceKorean(selectedModel.pricing.threeMonths)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPrinterImage(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      선택 완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}