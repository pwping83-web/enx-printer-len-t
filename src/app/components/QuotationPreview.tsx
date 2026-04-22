import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FileText, Calendar, CreditCard, Building2, User, Phone, Mail, Printer, Info, AlertCircle } from 'lucide-react';
import { QuotationData } from './QuotationForm';
import { getPricingConfig } from '../utils/pricingConfig';

/**
 * Quotation Preview Component - Premium v2
 * - Modern card-based layout with subtle shadows
 * - Gradient header with icon
 * - Better price breakdown with visual hierarchy
 * - Service terms with icons
 */
interface QuotationPreviewProps {
  data: QuotationData;
}

export function QuotationPreview({ data }: QuotationPreviewProps) {
  const config = getPricingConfig();
  const isPurchase = data.transactionType === 'purchase';

  const printerModels = [
    { id: 'Epson-3156-A4', name: 'Epson 3156 A4', pricing: config.models.epson3156A4, installationFee: 150000 },
    { id: 'Epson-1390-A3', name: 'Epson 1390 A3', pricing: config.models.epson1390A3, installationFee: 170000 },
    { id: 'Epson-3880-P800-A2', name: 'Epson 3880/P800 A2', pricing: config.models.epson3880P800A2, installationFee: 170000 },
  ];

  const selectedModel = printerModels.find((m) => m.id === data.printerModel);

  // Purchase pricing
  const PURCHASE_PRICE = 2000000;
  const PURCHASE_PRICE_LABEL = '200만원';
  const purchaseSubtotal = PURCHASE_PRICE * data.quantity;
  const purchaseVat = Math.round(purchaseSubtotal * 0.1);
  const purchaseGrandTotal = purchaseSubtotal + purchaseVat;

  // Rental pricing
  let baseMonthlyPrice = 0;
  if (selectedModel) {
    if (data.rentalPeriod === 1) {
      baseMonthlyPrice = Math.round(selectedModel.pricing.threeMonths * 1.35);
    } else if (data.rentalPeriod >= 12) {
      baseMonthlyPrice = selectedModel.pricing.twelveMonths;
    } else if (data.rentalPeriod >= 6) {
      baseMonthlyPrice = selectedModel.pricing.sixMonths;
    } else {
      baseMonthlyPrice = selectedModel.pricing.threeMonths;
    }
  }

  const monthlyPrice = baseMonthlyPrice;
  const totalPrice = monthlyPrice * data.rentalPeriod * data.quantity;
  const installationFee = selectedModel?.installationFee || 170000;
  const includeInstallationFee = data.includeInstallationFee !== false;
  const appliedInstallationFee = includeInstallationFee ? installationFee : 0;
  const subtotal = totalPrice + appliedInstallationFee;
  const vat = Math.round(subtotal * 0.1);
  const grandTotalWithVat = subtotal + vat;

  const endDate = new Date(data.startDate);
  endDate.setMonth(endDate.getMonth() + data.rentalPeriod);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_20px_rgb(0,0,0,0.06)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1">{isPurchase ? '구매 견적서' : '렌탈 견적서'}</h1>
            <p className="text-sm text-white/70">{isPurchase ? '식용 프린터 판매 특가' : '식용 프린터 렌탈 서비스'}</p>
          </div>
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-7 h-7 text-white/80" />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Company Info - Two Columns */}
        <div className="grid grid-cols-1 gap-4">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              고객 정보
            </h2>
            <div className="space-y-2">
              {[
                { icon: Building2, label: '회사명', value: data.companyName },
                { icon: User, label: '담당자', value: data.contactName },
                { icon: Phone, label: '연락처', value: data.phone },
                { icon: Mail, label: '이메일', value: data.email },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-gray-400" />
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              공급자 정보
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { label: '회사명', value: '이앤엑스 (ENX)' },
                { label: '사업자번호', value: '302-47-00920' },
                { label: '연락처', value: '010-4639-2673' },
                { label: '주소', value: '인천 중구 운북동 506-59' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-indigo-400">{item.label}</span>
                  <span className="font-semibold text-indigo-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {isPurchase ? '구매 상세 내역' : '렌탈 상세 내역'}
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            {isPurchase ? (
              <>
                {[
                  { label: '프린터 모델', value: 'Epson 3156 A4' },
                  { label: '구매 수량', value: `${data.quantity}대` },
                  { label: '거래 유형', value: '판매 특가' },
                  { label: 'A/S 보증', value: '1년 무상 (잉크막힘 제외)' },
                  { label: '설치비', value: '없음' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: '프린터 모델', value: selectedModel?.name || '-' },
                  { label: '수량', value: `${data.quantity}대` },
                  { label: '렌탈 기간', value: `${data.rentalPeriod}개월` },
                  { label: '시작일', value: format(new Date(data.startDate), 'yyyy년 MM월 dd일', { locale: ko }) },
                  { label: '종료일', value: format(endDate, 'yyyy년 MM월 dd일', { locale: ko }) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            가격 산출 내역
          </h2>

          {isPurchase ? (
            /* 구매 가격 산출 */
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">판매 특가 (단가)</span>
                <span className="font-semibold text-gray-900">{PURCHASE_PRICE_LABEL}</span>
              </div>
              {data.quantity > 1 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">수량</span>
                  <span className="font-semibold text-gray-900">{data.quantity}대</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">설치비</span>
                <span className="font-semibold text-emerald-600">없음</span>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">공급가액</span>
                  <span className="text-xl font-black text-indigo-600">{purchaseSubtotal.toLocaleString()}원</span>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 bg-white rounded-md text-[10px] font-semibold text-gray-500 border border-gray-200">부가세 별도</span>
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 rounded-md text-[10px] font-semibold text-emerald-600 border border-emerald-100">1년 무상 A/S 포함</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">부가세 (10%)</span>
                  <span className="font-semibold text-gray-700">{purchaseVat.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-gray-900">부가세 포함 총금액</span>
                  <span className="text-xl font-black text-pink-600">{purchaseGrandTotal.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          ) : (
            /* 렌탈 가격 산출 */
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">프린터 렌탈료 (기본)</span>
                <span className="font-semibold text-gray-900">{baseMonthlyPrice.toLocaleString()}원/월</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">월 렌탈료</span>
                <span className="font-bold text-gray-900">{monthlyPrice.toLocaleString()}원</span>
              </div>

              <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700">총 {data.rentalPeriod}개월 렌탈 비용</span>
                <span className="font-bold text-gray-900">{totalPrice.toLocaleString()}원</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">최초 설치비</span>
                <span className="font-semibold text-gray-900">
                  {includeInstallationFee ? `${installationFee.toLocaleString()}원` : '없음'}
                </span>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">최종 결제 금액</span>
                  <span className="text-xl font-black text-indigo-600">{subtotal.toLocaleString()}원</span>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 bg-white rounded-md text-[10px] font-semibold text-gray-500 border border-gray-200">부가세 별도</span>
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 rounded-md text-[10px] font-semibold text-emerald-600 border border-emerald-100">인쇄 프로그램 무료</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">부가세 (10%)</span>
                  <span className="font-semibold text-gray-700">{vat.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-gray-900">부가세 포함 총금액</span>
                  <span className="text-xl font-black text-pink-600">{grandTotalWithVat.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Service Terms */}
        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            서비스 내용
          </h2>
          <ul className="space-y-2 text-xs text-gray-600">
            {(isPurchase ? [
              '구매일로부터 1년간 무상 A/S를 제공합니다.',
              '단, 잉크막힘으로 인한 수리는 유상으로 처리됩니다.',
              '식용잉크는 국내산·수입산 구매 링크를 제공해 드립니다.',
              '설치비는 별도 청구되지 않습니다.',
              '1년 보증 기간 이후 유상 A/S 서비스를 이용하실 수 있습니다.',
            ] : [
              '정기 점검 및 유지보수 서비스가 포함되어 있습니다.',
              '소모품 및 부품 교체는 무상으로 제공됩니다.',
              '식용잉크는 국내산·수입산 구매 링크를 제공해 드립니다.',
              '중도 해지 시 위약금은 없으며, 기납부 렌탈료는 소멸됩니다.',
              '계약 기간 종료 후 재계약 또는 반환을 선택하실 수 있습니다.',
            ]).map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Validity Notice */}
        <div className="border-t border-gray-100 pt-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">견적 유효기간 안내</p>
              <p className="text-xs text-amber-700 mt-1">
                본 견적서는 서명일로부터 <strong>2주간(14일)</strong> 유효합니다.
                유효기간 경과 후에는 가격 및 조건이 변경될 수 있으며, 새로운 견적서를 요청해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}