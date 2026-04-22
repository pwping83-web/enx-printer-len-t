import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { getSupabaseClient } from '/utils/supabase/client';
import emailjs from '@emailjs/browser';
import DaumPostcode from 'react-daum-postcode';
import { toast } from 'sonner';
import { handleImageSelect, handleVideoSelect } from "./ImageUploadHandlers";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertCircle,
  Search,
  Printer,
  ChevronRight,
  ChevronLeft,
  X,
  Camera,
  User,
  Video,
  FileText,
  Shield,
  CheckCircle,
} from "lucide-react";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_dtiuz62";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_8dglgra";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "7-EF2vKlS3sc_N5rp";

export function CustomerRequest() {
  const navigate = useNavigate();
  
  // 🔥 금액을 한국식 "만원" 단위로 포맷팅하는 함수 (반올림)
  const formatKoreanWon = (amount: number): string => {
    const manwon = amount / 10000;
    if (manwon === Math.floor(manwon)) {
      // 정수인 경우 (예: 40만원, 80만원)
      return `${manwon}만원`;
    } else {
      // 소수점이 있는 경 (예: 45.5)
      return `${manwon.toFixed(1)}만원`;
    }
  };
  
  // 🔥 시스템 초기화
  useEffect(() => {
    // 시스템 초기화 완료
  }, []);
  
  // 개인정보 동의
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  
  // 견적 제출 중 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔥 압축 중 상태 (갤럭시 안정화)
  const [isCompressing, setIsCompressing] = useState(false);
  
  // 🔥 업로드 진행 상황 상태
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  
  // 🔥 거리 계산 중 상태
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  
  // 🔥 다음 주소 검색 레이어 팝업 상태
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  
  // 🔥 예약 불가능 날짜 상태
  const [disabledDates, setDisabledDates] = useState<string[]>([]);
  
  // 🔥 달력 현재 월 상태
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 🔥 커스텀 달력 모달 상태
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // 🔥 Supabase에서 예약 가능 날짜 불러오기 (DB 직접 연결)
  useEffect(() => {
    const loadDisabledDates = async () => {
      try {
        console.log('📅 [고객] 예약 불가 날짜 조회 중 (DB)...');
        
        // Edge Function 대신 DB 직접 조회
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('blocked_dates')
          .select('date');
        
        if (error) {
          // 🔥 테이블이 없는 경우 자동 생성 시도
          if (error.code === 'PGRST205') {
            console.log('🔧 [고객] 테이블 없음 → 서버에서 자동 생성 시도...');
            try {
              const { projectId, publicAnonKey } = await import('/utils/supabase/info');
              await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-36c58641/init-db`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              });
              // 잠시 대기 후 재시도
              await new Promise(resolve => setTimeout(resolve, 2000));
              const { data: retryData } = await supabase.from('blocked_dates').select('date');
              const dates = retryData?.map(row => row.date) || [];
              setDisabledDates(dates);
              console.log(`✅ [고객] 테이블 생성 후 로드 완료: ${dates.length}개`);
              return;
            } catch (initErr) {
              console.error('❌ [고객] 자동 생성 실패:', initErr);
            }
          }
          throw error;
        }
        
        const dates = data?.map(row => row.date) || [];
        console.log(`✅ [고객] 로드 완료: ${dates.length}개`);
        setDisabledDates(dates);
      } catch (error) {
        console.error('❌ [고객] 날짜 로드 실패:', error);
        // 실패 시 빈 배열(모든 날짜 예약 가능)로 두거나 재시도 로직 추가
      }
    };
    
    loadDisabledDates();
  }, []);
  
  const [formData, setFormData] = useState({
    printerType: "", 
    symptoms: [] as string[], 
    selectedSymptoms: [] as string[],
    symptomDetails: {} as Record<string, string>,
    moveDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    moveTime: "",
    customerName: "",
    customerPhone: "",
    visitAddress: "",
    visitAddressDetail: "",
    visitElevator: false,
    visitStairs: false,
    visitStairsFloor: "",
    distanceRange: "metro", 
    actualDistance: 0, 
    estimateAmount: 400000,
    basePrice: 400000,
    additionalCost: 0,
    uploadedImageUrls: [] as string[], // ✅ 방음부스 방식: 업로드된 URL만 저장
    additionalNotes: "",
  });

  // 🔥 주소 검색 버튼 클릭 핸들러
  const handleAddressSearch = () => {
    setShowAddressPopup(true);
  };

  // 🔥 주소 선택 완료 핸들러 (부산/지방 거리 강제 보정 포함)
  const handleAddressComplete = async (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
      fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
    }

    setFormData(prev => ({ ...prev, visitAddress: fullAddress }));
    setShowAddressPopup(false);
    setIsCalculatingDistance(true);

    const FIXED_BASE_METRO = 400000;    
    const BASE_PRICE = 400000;          
    const BUSAN_DISTANCE = 400;         
    const ADDITIONAL_FOR_BUSAN = 400000;

    try {
      console.log('🔍 === 거리 계산 시작 ===');
      console.log('🔍 선택된 주소:', fullAddress);
      
      // 카카오 API 사용 불가 시 조용히 비상 모드로 전환
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.log('ℹ️ 카카오 지도 API 미사용 - 지역별 예상 거리 계산 모드');
        throw new Error('FALLBACK_MODE');
      }
      
      console.log('✅ 카카오 API 사용 가능 - 정확한 거리 계산');

      const geocoder = new window.kakao.maps.services.Geocoder();
      console.log('✅ Geocoder 인스턴스 생성됨');
      
      const getCoordinates = (addr: string): Promise<{ lat: number, lng: number }> => {
        return new Promise((resolve, reject) => {
          console.log('🔍 주소 검색 중:', addr);
          
          geocoder.addressSearch(addr, (result: any, status: any) => {
            console.log('🔍 주소 검색 결과:', {
              주소: addr,
              상태: status,
              결과수: result?.length || 0
            });
            
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
              console.log('✅ 좌표 변환 성공:', coords);
              resolve(coords);
            } else {
              console.error('❌ 주소 검색 실패:', { 주소: addr, 상태: status });
              reject(new Error('주소 검색 실패'));
            }
          });
        });
      };

      console.log('🔍 출발지(사무실) 좌표 검색 시작...');
      const companyCoords = await getCoordinates('인천광역시 중구 운북동');
      console.log('✅ 사무실 좌표:', companyCoords);
      
      console.log('🔍 목적지(고객) 좌표 검색 시작...');
      const customerCoords = await getCoordinates(fullAddress);
      console.log('✅ 고객 좌표:', customerCoords);

      const R = 6371; 
      const dLat = (customerCoords.lat - companyCoords.lat) * Math.PI / 180;
      const dLon = (customerCoords.lng - companyCoords.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(companyCoords.lat * Math.PI / 180) * Math.cos(customerCoords.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      let distance = R * c * 1.3;
      console.log('🔍 거리 계산:', {
        '직선거리': (R * c).toFixed(1) + 'km',
        '도로거리(x1.3)': distance.toFixed(1) + 'km'
      });

      // 🚨 [강제 보정 로직]
      const beforeCorrection = distance;
      if (fullAddress.includes('부산') || fullAddress.includes('기장') || fullAddress.includes('운대')) {
         if (distance < 380) distance = 400; 
      } else if (fullAddress.includes('울산') || fullAddress.includes('양산') || fullAddress.includes('김해')) {
         if (distance < 350) distance = 360;
      } else if (fullAddress.includes('대구') || fullAddress.includes('경산') || fullAddress.includes('구미')) {
         if (distance < 250) distance = 290;
      } else if (fullAddress.includes('광주') || fullAddress.includes('전남') || fullAddress.includes('목포')) {
         if (distance < 250) distance = 320;
      } else if (fullAddress.includes('강원') || fullAddress.includes('강릉') || fullAddress.includes('속초')) {
         if (distance < 200) distance = 230;
      } else if (fullAddress.includes('대전') || fullAddress.includes('세') || fullAddress.includes('충남')) {
         if (distance < 150) distance = 160;
      }
      
      if (beforeCorrection !== distance) {
        console.log('🔧 거리 보정:', beforeCorrection.toFixed(1) + 'km → ' + distance.toFixed(1) + 'km');
      } else {
        console.log('✅ 보정 불필요, 최종 거리:', distance.toFixed(1) + 'km');
      }

      applyDistanceAndPrice(distance, fullAddress);

    } catch (error) {
      console.log('ℹ️ 지역명 기반 예상 거리 계산 중...');
      
      let estimatedDist = 0;
      if (fullAddress.includes('부산') || fullAddress.includes('울산') || fullAddress.includes('경남')) estimatedDist = 400;
      else if (fullAddress.includes('대구') || fullAddress.includes('경북') || fullAddress.includes('포항')) estimatedDist = 300;
      else if (fullAddress.includes('광주') || fullAddress.includes('전남') || fullAddress.includes('목포')) estimatedDist = 320;
      else if (fullAddress.includes('강원') || fullAddress.includes('속초') || fullAddress.includes('강릉')) estimatedDist = 220;
      else if (fullAddress.includes('전북') || fullAddress.includes('전주')) estimatedDist = 230;
      else if (fullAddress.includes('대전') || fullAddress.includes('충남') || fullAddress.includes('충북') || fullAddress.includes('청주') || fullAddress.includes('세종')) estimatedDist = 160;
      else estimatedDist = 0;

      console.log('✅ 예상 거리 산출:', estimatedDist + 'km (지역명 기반)');
      applyDistanceAndPrice(estimatedDist, fullAddress);
    }

    function applyDistanceAndPrice(distance: number, addr: string) {
      let basePrice = FIXED_BASE_METRO;
      let additionalCost = 0;
      let totalEstimate = FIXED_BASE_METRO;
      let distanceRange = 'metro';

      if (addr.includes('서울') || addr.includes('인천') || addr.includes('경기')) {
        distance = 0; 
        distanceRange = 'metro';
      } else {
        distanceRange = 'other';
        basePrice = BASE_PRICE;
        
        const distanceRatio = distance / BUSAN_DISTANCE;
        const calculatedAdditional = distanceRatio * ADDITIONAL_FOR_BUSAN;
        additionalCost = Math.ceil(calculatedAdditional / 10000) * 10000;
        
        if (additionalCost < 50000 && distance > 50) additionalCost = 50000;
        totalEstimate = basePrice + additionalCost;
      }

      setFormData(prev => ({ 
        ...prev, 
        visitAddress: addr, 
        actualDistance: distance,
        estimateAmount: totalEstimate,
        basePrice: basePrice,
        additionalCost: additionalCost,
        distanceRange: distanceRange
      }));

      setIsCalculatingDistance(false);
    }
  };

  // 🗑️ 업로드된 이미지/영상 삭제
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedImageUrls: prev.uploadedImageUrls.filter((_, idx) => idx !== index),
    }));
    toast.success('파일 삭제 완료');
  };

  // 🔥 견적 요청 제출 (방음부스 방식: 이미 업로드된 URL 사용)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.printerType || !formData.customerName || !formData.customerPhone || !formData.visitAddress || !formData.moveDate) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }
    
    if (!privacyAgreed) {
      toast.error("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('견적을 전송하고 있습니다...');
    
    try {
      const requestId = Math.random().toString(36).substr(2, 9);
      const recipientPhone = formData.customerPhone;
      const adminEmails = ['tseizou@naver.com'];
      
      const distanceRangeText = formData.actualDistance 
        ? `약 ${formData.actualDistance}km` 
        : (formData.distanceRange === 'metro' ? '서울·경기·인천' : '부산');
      
      const symptomsFormatted = formData.symptoms.length > 0 
        ? formData.symptoms.join('<br>')
        : '선택 안함';
      const symptomCount = formData.symptoms.length;
      const primaryIssueType = formData.symptoms[0] || '일반 접수';
      const hasMemo = !!formData.additionalNotes?.trim();
      const now = new Date();
      const urgency = formData.symptoms.includes('전원불량') ? '긴급' : '일반';
      const swAction = formData.symptoms.includes('작동불량') || formData.symptoms.includes('기타');
      const hwAction = formData.symptoms.includes('잉크막힘') || formData.symptoms.includes('전원불량');
      const symptomTagsHtml = formData.symptoms.length > 0
        ? formData.symptoms.map((symptom) =>
            `<span style="display:inline-block;background:#EEF2FF;border:1px solid #C7D2FE;border-radius:999px;padding:5px 12px;margin:0 6px 8px 0;color:#4338CA;font-size:12px;font-weight:700;">${symptom}</span>`
          ).join('')
        : `<span style="display:inline-block;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:999px;padding:5px 12px;color:#94A3B8;font-size:12px;font-weight:600;">증상 미선택</span>`;
      
      // ✅ 방음부스 방식: 이미 업로드된 URL 사용
      const uploadedImageUrls = formData.uploadedImageUrls || [];
      let imageLinksHtml = '';
      
      // ✅ 방음부스 방식: 이미지 링크 HTML 생성 (이미 업로드되어 있음)
      if (uploadedImageUrls.length > 0) {
        console.log(`✅ 업로드된 파일: 총 ${uploadedImageUrls.length}개`);
        
        // ✅ 방음부스 방식: 이미지 링크 HTML 생성 (업로드는 이미 완료됨)
        imageLinksHtml = uploadedImageUrls.map((url, idx) => {
          if (url.includes('.webm') || url.includes('.mp4')) {
            return `<p>🎬 동영상 ${idx+1}: <a href="${url}">보기</a></p>`;
          } else {
            return `<p>📸 사진 ${idx+1}: <a href="${url}">보기</a></p><img src="${url}" width="200" style="display:block; margin-bottom:10px;" />`;
          }
        }).join('');
      } else {
        console.log('ℹ️ 첨부 파일 없음');
      }
      
      // 📧 이메일 전송
      emailjs.init(EMAILJS_PUBLIC_KEY);
      
      const templateParams = {
        to_email: adminEmails.join(', '),
        request_id: requestId.toUpperCase(),
        request_date: now.toLocaleString('ko-KR'),
        printer_model: formData.printerType || '정보 없음',
        printer_type: formData.printerType || '정보 없음',
        symptoms: symptomsFormatted,
        description: formData.additionalNotes || '없음',
        additional_notes: formData.additionalNotes || '없음',
        customer_name: formData.customerName,
        customer_phone: recipientPhone,
        customer_address: formData.visitAddress,
        customer_address_detail: formData.visitAddressDetail || '상세주소 없음',
        visit_date: formData.moveDate,
        visit_time: formData.moveTime || '시간 미정',
        move_date: formData.moveDate,
        move_time: formData.moveTime || '시간 미정',
        visit_address: formData.visitAddress,
        visit_address_detail: formData.visitAddressDetail || '상세주소 없음',
        distance_range: distanceRangeText,
        base_price: calculateAIEstimate.basePrice.toLocaleString(),
        additional_cost: calculateAIEstimate.additionalCost.toLocaleString(),
        total_price: calculateAIEstimate.totalPrice.toLocaleString(),
        media_links: imageLinksHtml,
        printer_images: imageLinksHtml,
        image_count: uploadedImageUrls.length,
        mail_subject: `[ENX 수리접수] ${formData.printerType || '프린터'} - ${formData.customerName} 님의 수리 요청입니다`,
        recipientPhone: recipientPhone,
        // New template variables (Contact Us: template_8dglgra)
        urgency,
        phone: recipientPhone,
        date: now.toLocaleDateString('ko-KR'),
        time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        issue_type: primaryIssueType,
        symptom_count: symptomCount,
        symptom_tags: symptomTagsHtml,
        has_memo: hasMemo,
        memo: formData.additionalNotes || '',
        sw_action: swAction,
        hw_action: hwAction,
      };
      
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      
      console.log('📧 이메일 전송 완료!');
      
      // 💾 Supabase DB 저장
      const supabase = getSupabaseClient();
      
      const quoteData = {
        printer_model: formData.printerType,
        symptoms: formData.symptoms,
        description: formData.additionalNotes || '',
        customer_name: formData.customerName,
        customer_phone: recipientPhone,
        customer_address: `${formData.visitAddress} ${formData.visitAddressDetail || ''}`.trim(),
        visit_date: formData.moveDate,
        visit_time: formData.moveTime || '',
        total_price: calculateAIEstimate.totalPrice,
        image_urls: uploadedImageUrls,
      };
      
      console.log('💾 Supabase DB 저장 시작:', quoteData);
      
      const { data: insertedData, error: dbError } = await supabase
        .from('printer_repair_requests')
        .insert([quoteData])
        .select();
      
      if (dbError) {
        console.error('❌ DB 저장 실패:', dbError);
        throw new Error(`DB 저장 실패: ${dbError.message}`);
      }
      
      console.log('✅ DB 저장 완료:', insertedData);
      
      toast.dismiss(loadingToast);
      toast.success('견적 요청이 성공적으로 접수되었습니다!');
      
      navigate('/success', {
        state: {
          requestId: requestId,
          customerName: formData.customerName,
          customerPhone: recipientPhone
        }
      });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => {
      const currentSymptoms = prev.symptoms || [];
      const isSelected = currentSymptoms.includes(symptom);
      
      if (isSelected) {
        return {
          ...prev,
          symptoms: currentSymptoms.filter(s => s !== symptom),
          selectedSymptoms: currentSymptoms.filter(s => s !== symptom)
        };
      } else {
        return {
          ...prev,
          symptoms: [...currentSymptoms, symptom],
          selectedSymptoms: [...currentSymptoms, symptom]
        };
      }
    });
  };

  const calculateAIEstimate = useMemo(() => {
    const HARD_FIXED_BASE_METRO = 400000;
    const BUSAN_DISTANCE = 400;
    const BASE_PRICE = 400000;
    const ADDITIONAL_FOR_BUSAN = 400000;
    
    let baseFee = HARD_FIXED_BASE_METRO;
    let distanceAdditionalCost = 0;
    const actualDistance = formData.actualDistance || 0;
    
    if (formData.distanceRange === "metro") {
      baseFee = HARD_FIXED_BASE_METRO;
      distanceAdditionalCost = 0;
    } else if (formData.distanceRange === "other" && actualDistance > 0) {
      baseFee = BASE_PRICE;
      const distanceRatio = actualDistance / BUSAN_DISTANCE;
      const calculatedAdditional = distanceRatio * ADDITIONAL_FOR_BUSAN;
      distanceAdditionalCost = Math.ceil(calculatedAdditional / 10000) * 10000;
    }
    
    return {
      basePrice: baseFee,
      additionalCost: distanceAdditionalCost,
      totalPrice: baseFee + distanceAdditionalCost,
      isValid: formData.visitAddress !== ""
    };
  }, [formData.distanceRange, formData.actualDistance, formData.visitAddress]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-100"
      >
        <div className="max-w-2xl mx-auto px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-black text-gray-900">프린터 출장 수리 견적</h1>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border-b border-gray-100 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {[
            { label: "프린터", done: !!formData.printerType },
            { label: "증상", done: formData.symptoms.length > 0 },
            { label: "일시", done: !!formData.moveDate && !!formData.moveTime },
            { label: "정보", done: !!formData.customerName && !!formData.visitAddress },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step.done ? <CheckCircle className="w-3 h-3" /> : idx + 1}
              </div>
              <span className={`text-[10px] font-bold ${step.done ? "text-green-700" : "text-gray-400"}`}>
                {step.label}
              </span>
              {idx < 3 && <div className={`w-6 h-0.5 mx-0.5 ${step.done ? "bg-green-300" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-3 py-3 space-y-2.5">
        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }} className="bg-gradient-to-br from-blue-50 to-blue-100/60 rounded-3xl shadow-sm p-4 border border-blue-100/50">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              <Printer className="w-3.5 h-3.5 inline mr-1" />
              프린터 기종 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.printerType}
              onChange={(e) => setFormData({ ...formData, printerType: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-white border-0 rounded-3xl focus:ring-2 focus:ring-blue-400 shadow-sm"
              placeholder="예: 엡손1390 (기종명을 모르면 '모름' 입력)"
            />
          </div>
        </motion.div>

        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100/50 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
              고장 증상 (복수 선택 가능)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { value: '잉크막힘', label: '잉크 막힘', icon: '💧' },
                { value: '작동불량', label: '작동 불량', icon: '⚠️' },
                { value: '전원불량', label: '전원 불량', icon: '🔌' },
                { value: '기타', label: '기타', icon: '📝' }
              ].map((symptom) => (
                <button
                  key={symptom.value}
                  type="button"
                  onClick={() => toggleSymptom(symptom.value)}
                  className={`px-4 py-3 text-sm font-medium rounded-2xl transition-all ${
                    formData.selectedSymptoms.includes(symptom.value)
                      ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-2">{symptom.icon}</span>
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              <Camera className="w-3.5 h-3.5 inline mr-1" />
              고장 부위 사진 또는 증상 영상 (여러 장 선택 가능)
            </label>
            
            {/* 🔥 사진/영상 버튼 ���리 (갤럭시 안정화) */}
            <div className="grid grid-cols-2 gap-3">
              {/* 📸 사진 전용 버튼 */}
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-blue-500 rounded-3xl cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-all bg-white">
                <Camera className="w-7 h-7 text-blue-500 mb-1" />
                <span className="text-sm text-gray-700 font-bold mb-0.5">📸 사진 첨부</span>
                <span className="text-xs text-gray-500 px-4 text-center leading-relaxed">
                  3~5장씩 나누어<br/>등록해주세요
                </span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handleImageSelect(e, formData.uploadedImageUrls, setFormData, setIsCompressing, setUploadProgress)} 
                  className="hidden"
                  disabled={uploadProgress !== null}
                />
              </label>
              
              {/* 🎬 영상 전용 버튼 */}
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-purple-500 rounded-3xl cursor-pointer hover:bg-purple-50 hover:border-purple-600 transition-all bg-white">
                <Video className="w-7 h-7 text-purple-500 mb-1" />
                <span className="text-sm text-gray-700 font-bold mb-0.5">🎬 영상 첨부</span>
                <span className="text-xs text-gray-500 px-4 text-center leading-relaxed">
                  10초 미만<br/>100MB 이하
                </span>
                <input 
                  type="file" 
                  multiple 
                  accept="video/*" 
                  onChange={(e) => handleVideoSelect(e, formData.uploadedImageUrls, setFormData, setUploadProgress)} 
                  className="hidden"
                  disabled={uploadProgress !== null}
                />
              </label>
            </div>

            {/* 🔥 업로드 진행 바 (파일 선택 직후 표시) */}
            {uploadProgress && (
              <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-sm p-4 border-2 border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-blue-600 animate-pulse" />
                      <span className="text-sm font-bold text-blue-900">
                        업로드 중... ({uploadProgress.current + 1}/{uploadProgress.total})
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {Math.round(((uploadProgress.current + 1) / uploadProgress.total) * 100)}%
                    </span>
                  </div>
                  
                  {/* 프로그레스 바 */}
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-md"
                      style={{ width: `${((uploadProgress.current + 1) / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-blue-700 text-center font-medium">
                    ⏳ 파일 크기에 따라 1~2분 정도 소요될 수 있습니다
                  </p>
                </div>
              </div>
            )}
            
            {formData.uploadedImageUrls.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {formData.uploadedImageUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm group">
                      {url.includes('.webm') || url.includes('.mp4') ? (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100">
                          <Video className="w-8 h-8 text-purple-600" />
                        </div>
                      ) : (
                        <img src={url} alt={`업로드 ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                
                {/* 📹 업로드 완료 안내 */}
                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-[10px] text-green-700 leading-relaxed">
                    ✅ {formData.uploadedImageUrls.length}개 파일 업로드 완료!
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.25 }} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100/50">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              상세 고장 내용 <span className="text-xs text-gray-400 font-normal">(선택사항)</span>
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 text-sm bg-white border-0 rounded-3xl focus:ring-2 focus:ring-blue-400 resize-none shadow-sm"
              placeholder="구체적인 증상을 적어주시면 좋습니다."
            />
          </div>
        </motion.div>

        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100/50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800">방문 희망 날짜/시간</h2>
          </div>
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">방문 희망 날짜</label>
              {/* ✅ 커스텀 달력 UI 버튼 */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('달력 버튼 클릭됨!');
                  setShowCalendarModal(true);
                }}
                className="w-full px-5 py-4 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-200 transition-colors active:scale-[0.98]"
              >
                <span className={`text-base font-bold ${formData.moveDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.moveDate ? formData.moveDate : '날짜를 선택해주세요'}
                </span>
                
                {/* 파란 달력 아이콘 박스 */}
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">방문 희망 시간</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { value: '10:00-12:00', label: '오전', time: '10시~12시' },
                  { value: '14:00-16:00', label: '오후', time: '14시~16시' },
                  { value: '16:00-18:00', label: '오후', time: '16시~18시' },
                  { value: '협의', label: '기타', time: '협의' }
                ].map((timeSlot) => (
                  <button
                    key={timeSlot.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, moveTime: timeSlot.value })}
                    className={`py-3 px-4 rounded-3xl text-sm font-medium transition-all border-0 shadow-sm ${formData.moveTime === timeSlot.value ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
                  >
                    <div className="flex flex-col items-center"><span className="text-xs opacity-75">{timeSlot.label}</span><span className="font-bold">{timeSlot.time}</span></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.35 }} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100/50 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800">고객 정보</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">고객 이름</label>
              <input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border-0 rounded-3xl focus:ring-2 focus:ring-blue-400 shadow-sm" placeholder="이름을 입력하세요" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">고객 전화번호</label>
              <input type="tel" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border-0 rounded-3xl focus:ring-2 focus:ring-blue-400 shadow-sm" placeholder="010-1234-5678" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">방문 주소 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input type="text" value={formData.visitAddress} onChange={(e) => setFormData({ ...formData, visitAddress: e.target.value })} className="w-full px-4 py-3 pr-10 text-sm bg-white border-0 rounded-3xl focus:ring-2 focus:ring-blue-400 shadow-sm" placeholder="주소를 입력하세요 →" required />
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button type="button" onClick={handleAddressSearch} className="px-4 py-3 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 transition-colors shadow-sm"><Search className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">상세 주소</label>
              <input type="text" value={formData.visitAddressDetail} onChange={(e) => setFormData({ ...formData, visitAddressDetail: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border-0 rounded-3xl focus:ring-2 focus:ring-blue-400 shadow-sm" placeholder="예: 3층, 호수 등" />
            </div>
            {isCalculatingDistance && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-center gap-3"><span className="text-sm font-medium text-blue-700">거리 계산 중...</span></div>
              </div>
            )}
            {calculateAIEstimate.isValid && !isCalculatingDistance && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-3xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div><p className="text-xs text-gray-600 mb-0.5">예상 출장비</p><p className="text-xl font-black text-green-700">{formatKoreanWon(calculateAIEstimate.totalPrice)}</p></div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100/50">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>
              </div>
              <div className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                견적 상담 및 서비스 제공을 위한 개인정보 수집 및 이용에 동의합니다.
              </div>
            </div>
          </label>
        </motion.div>

        {/* 제출 버튼 */}
        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.45 }}>
          <button
            type="submit"
            disabled={isSubmitting || isCompressing || !calculateAIEstimate.isValid}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed text-base active:scale-[0.97]"
          >
            {isCompressing ? '사진 압축 중...' : isSubmitting ? '전송 중...' : '견적 요청하기'}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-2">요청 후 담당자가 빠르게 연락드립니다</p>
        </motion.div>
      </form>

      {/* 주소 검색 팝업 */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">주소 검색</h3>
              <button
                onClick={() => setShowAddressPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: '500px' }}>
              <DaumPostcode
                onComplete={handleAddressComplete}
                autoClose={false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 🗓️ 커스텀 달력 모달 */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl w-full max-w-md md:max-w-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 md:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                <h3 className="text-xl md:text-2xl font-bold text-white">방문 짜 선택</h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </button>
            </div>

            {/* 달력 컨텐츠 */}
            <div className="p-5 md:p-8">
              {/* 월 네비게이션 */}
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <button
                  type="button"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="p-2 md:p-3 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                </button>
                
                <div className="text-center">
                  <h4 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="p-2 md:p-3 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                  <div key={day} className={`text-center py-2 md:py-3 text-sm md:text-base font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const lastDate = new Date(year, month + 1, 0).getDate();
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const days = [];

                  // 빈 칸 추가
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square" />);
                  }

                  // 날짜 버튼 추가
                  for (let date = 1; date <= lastDate; date++) {
                    const currentDate = new Date(year, month, date);
                    // ✅ 시차 문제 해결: toISOString() 대신 직접 문자열 생성
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const isPast = currentDate < today;
                    const isDisabled = disabledDates.includes(dateString) || isPast;
                    const isSelected = formData.moveDate === dateString;
                    const dayOfWeek = currentDate.getDay();
                    const isSunday = dayOfWeek === 0;
                    const isSaturday = dayOfWeek === 6;

                    days.push(
                      <button
                        key={date}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setFormData({ ...formData, moveDate: dateString });
                            setShowCalendarModal(false);
                          }
                        }}
                        className={`
                          aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg font-bold transition-all
                          ${isDisabled 
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                            : isSelected
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                              : 'bg-white hover:bg-blue-50 hover:scale-105 shadow-sm hover:shadow-md'
                          }
                          ${!isDisabled && !isSelected && isSunday ? 'text-red-500' : ''}
                          ${!isDisabled && !isSelected && isSaturday ? 'text-blue-500' : ''}
                          ${!isDisabled && !isSelected && !isSunday && !isSaturday ? 'text-gray-800' : ''}
                        `}
                      >
                        {date}
                      </button>
                    );
                  }

                  return days;
                })()}
              </div>

              {/* 안내 문구 */}
              <div className="mt-6 md:mt-8 bg-blue-50 rounded-2xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                    <p className="font-semibold text-blue-800 mb-1">예약 불가 날짜는 선택할 수 없습니다</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      회색으로 표시된 날짜는 이미 예약이 마감되었거나 지난 날짜입니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerRequest;