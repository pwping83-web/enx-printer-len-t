/**
 * Admin Dashboard Component
 * 
 * Real-time admin dashboard for managing printer repair requests with:
 * - View all requests from Supabase database
 * - Filter by status (pending/completed/all)
 * - Search by customer name, phone, or printer model
 * - View request details (images, videos, customer info, pricing)
 * - Update request status
 * - Manage blocked dates (prevent double bookings)
 * - Real-time updates when new requests arrive
 * 
 * Key Features:
 * - Full-width layout on desktop (different from user pages)
 * - Responsive table view
 * - Modal for detailed request view
 * - Calendar for managing blocked dates
 * - Direct database integration (no localStorage)
 * 
 * Data Flow:
 * 1. Fetch requests from Supabase → 2. Display in table → 3. Admin reviews
 * → 4. Update status → 5. Save to database → 6. Manage blocked dates
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { getSupabaseClient } from '/utils/supabase/client';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Search,
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  User,
  X,
  Lock,
  Trash2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Wrench,
  MessageSquare,
  Printer,
  Coins,
  TrendingUp,
} from "lucide-react";

interface Request {
  id: number; // BIGINT로 변경
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_address_detail?: string; // 상세주소
  printer_model: string;
  symptoms: string[];
  visit_date: string;
  visit_time: string;
  total_price: number;
  description: string;
  created_at: string;
  image_urls: string[];
  actual_distance?: number; // 실제 거리 (km)
}

export function AdminDashboard() {
  const navigate = useNavigate();
  
  // 🔥 만원 단위로 변환하는 함수
  const formatPriceInManwon = (price: number): string => {
    const manwon = price / 10000;
    if (manwon === Math.floor(manwon)) {
      // 정수인 경우 (예: 40만원, 80만원)
      return `${manwon}만원`;
    } else {
      // 소수점이 있는 경우 (예: 45.5만원)
      return `${manwon.toFixed(1)}만원`;
    }
  };
  
  // 🔥 날짜 포맷 함수 (2026-02-09 14:30 형식)
  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '날짜 없음';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return '날짜 형식 오류';
    }
  };
  
  // 🔐 비밀번호 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // 관리자 비밀번호 (실제 운영 시 환경변수나 안전한 곳에 저장)
  const ADMIN_PASSWORD = "kkus2011!!"; // 비밀번호를 원하는 값으로 변경하세요
  
  // 비밀번호 확인 (세션 스토리지에서 인증 상태 확인)
  useEffect(() => {
    const authenticated = sessionStorage.getItem("booscatch_admin_auth");
    if (authenticated === "true") {
      setIsAuthenticated(true);
    }
  }, []);
  
  // 비밀번호 제출
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("booscatch_admin_auth", "true");
      setPasswordError("");
    } else {
      setPasswordError("❌ 비밀번호가 올바르지 않습니다.");
      setPasswordInput("");
    }
  };
  
  // 로그아웃
  const handleLogout = () => {
    sessionStorage.removeItem("booscatch_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
    navigate("/");
  };
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [disabledDates, setDisabledDates] = useState<string[]>([]);
  
  // 🔥 Supabase에서 예약 불가능 날짜 불러오기 (DB 직접 연결)
  const loadDisabledDates = async () => {
    try {
      console.log('📅 [관리자] 예약 불가 날짜 조회 시작 (DB)...');
      const supabase = getSupabaseClient(); // 클라이언트 가져오기

      // Edge Function(fetch) 대신 DB 직접 조회
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('date')
        .order('date', { ascending: true });

      if (error) {
        // 🔥 테이블 없으면 자동 생성 시도
        if (error.code === 'PGRST205') {
          console.log('🔧 [관리자] blocked_dates 테이블 없음 → 자동 생성 시도...');
          const { projectId, publicAnonKey } = await import('/utils/supabase/info');
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-36c58641/init-db`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: retryData } = await supabase.from('blocked_dates').select('date').order('date', { ascending: true });
          const dates = retryData?.map(row => row.date) || [];
          setDisabledDates(dates);
          return;
        }
        throw error;
      }

      // 객체 배열([{date: "2024-..."}])을 문자열 배열(["2024-..."])로 변환
      const dates = data?.map(row => row.date) || [];
      console.log(`✅ [관리자] DB에서 ${dates.length}개 로드 완료`);
      setDisabledDates(dates);
    } catch (error: any) {
      console.error('❌ 날짜 조회 실패:', error.message);
      // 에러 발생 시 빈 배열로 초기화하지 않고 기존 유지하거나 알림
    }
  };
  
  // 컴포넌트 마운트 시 예약 불가능 날짜 불러오기
  useEffect(() => {
    // 🔥 최초 로드만 수행 (자동 동기화 제거)
    loadDisabledDates();
  }, []);
  
  // 🔥 견적 전송 완료 상태 추가
  const [completedRequests, setCompletedRequests] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("booscatch_completed_requests");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // 🔥 견적 전송 완료 토글 함수
  const toggleCompleted = (requestId: string) => {
    const newCompleted = new Set(completedRequests);
    if (newCompleted.has(requestId)) {
      newCompleted.delete(requestId);
    } else {
      newCompleted.add(requestId);
    }
    setCompletedRequests(newCompleted);
    localStorage.setItem("booscatch_completed_requests", JSON.stringify([...newCompleted]));
  };
  
  // 🔥 출장비 기본 설정 (프린터 수리용)
  const [serviceFees, setServiceFees] = useState({
    baseMetro: 400000, // 서울·경기·인천 기본 40만원
    kmRate: 1428 // km당 추가 요금 (약 1,428원/km)
  });
  const [editingFees, setEditingFees] = useState(false);
  
  // 🔥 localStorage에서 출장비 기본 설정 불러오기
  const loadServiceFees = async () => {
    try {
      const saved = localStorage.getItem('printer_service_fees');
      if (saved) {
        const fees = JSON.parse(saved);
        setServiceFees(fees);
      } else {
        // 🔥 localStorage에 값이 없으면 기본값(40만원) 저장
        const defaultFees = {
          baseMetro: 400000, // 서울·경기·인천 기본 40만원
          kmRate: 1428
        };
        localStorage.setItem('printer_service_fees', JSON.stringify(defaultFees));
        setServiceFees(defaultFees);
      }
    } catch (error) {
      // 에러 무시
    }
  };
  
  // 🔥 출장비 기본 설정 저장 함수
  const saveServiceFees = async () => {
    try {
      localStorage.setItem('printer_service_fees', JSON.stringify(serviceFees));
      alert('✅ 출장비 기본 설정이 저장되었습니다!');
      setEditingFees(false);
    } catch (error) {
      alert('❌ 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  // 🔥 달력 UI용 상태
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 달력 날짜 클릭 처리 (상태만 변경, 저장은 버튼 클릭 시)
  const handleDateClick = (date: Date) => {
    // 로컬 시간 기준으로 날짜 문자열 생성 (타임존 문제 해결)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const isDisabled = disabledDates.includes(dateString);
    let newDisabledDates;

    if (isDisabled) {
      // 날짜 활성화 (제거)
      newDisabledDates = disabledDates.filter((d) => d !== dateString);
    } else {
      // 날짜 비활성화 (추가)
      newDisabledDates = [...disabledDates, dateString].sort();
    }

    setDisabledDates(newDisabledDates);
  };
  
  // 🔥 예약 불가능 날짜 저장 함수 (DB 직접 사용)
  const saveDisabledDates = async () => {
    setIsSaving(true);
    try {
      console.log('💾 예약 불가 날짜 저장 시작 (DB Direct):', disabledDates);
      const supabase = getSupabaseClient();

      // ① 기존 데이터 전체 삭제 (간단한 동기화를 위해)
      // 주의: id가 0이 아닌 모든 행 삭제 (안전장치)
      const { error: deleteError } = await supabase
        .from('blocked_dates')
        .delete()
        .neq('id', 0); 

      if (deleteError) throw deleteError;

      // ② 선택된 날짜들 새로 대량 삽입
      if (disabledDates.length > 0) {
        const insertData = disabledDates.map(date => ({ date }));
        const { error: insertError } = await supabase
          .from('blocked_dates')
          .insert(insertData);

        if (insertError) throw insertError;
      }
      
      alert(`✅ 예약 불가 날짜가 DB에 저장되었습니다! (총 ${disabledDates.length}개)`);
      await loadDisabledDates(); // 최신 데이터 다시 확인
    } catch (error: any) {
      console.error('저장 실패:', error);
      alert(`❌ 저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 🔥 전/다음 달 네비게이션
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  // 🔥 달력 날짜 생성
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 해당 월의 첫 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 시작 요일 (0: 일요일, 6: 토요일)
    const startDayOfWeek = firstDay.getDay();
    
    // 날짜 배열 생성
    const dates: (Date | null)[] = [];
    
    // 이전 달 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null);
    }
    
    // 현재 달 날짜
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }
    
    return dates;
  };

  // 🔥 날짜 삭제 처리
  const handleDateRemove = (dateString: string) => {
    const newDisabledDates = disabledDates.filter((d) => d !== dateString);
    setDisabledDates(newDisabledDates);
  };

  // 데이터 가져오기
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔥 Supabase에서 직접 데이터 조회
      const supabase = getSupabaseClient();
      
      console.log('📡 Supabase에서 수리 요청 조회 중...');
      
      const { data, error } = await supabase
        .from('printer_repair_requests')
        .select('*')
        .order('created_at', { ascending: false }); //  DB 컬럼명으로 변경
      
      if (error) {
        console.error('❌ Supabase 조회 에러:', error);
        
        // 🔥 테이블이 없는 경우 자동 생성 시도
        if (error.code === 'PGRST205') {
          console.log('🔧 테이블 자동 생성 시도 중...');
          try {
            const { projectId, publicAnonKey } = await import('/utils/supabase/info');
            const initUrl = `https://${projectId}.supabase.co/functions/v1/make-server-36c58641/init-db`;
            const initRes = await fetch(initUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            });
            const initResult = await initRes.json();
            console.log('🔧 init-db 응답:', initResult);
            
            if (initResult.success) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              setError('✅ 테이블이 자동 생성되었습니다. 페이지를 새로고침합니다...');
              setTimeout(() => window.location.reload(), 1500);
              return;
            }
          } catch (initError) {
            console.error('❌ 자동 테이블 생성 실패:', initError);
          }
          
          setError(`📋 데이터베이스 테이블이 아직 생성되지 않았습니다.\n\n✅ 페이지를 새로고침하면 자동으로 테이블이 생성됩니다.`);
          setRequests([]);
          setLoading(false);
          return;
        }
        
        throw error;
      }
      
      console.log('✅ Supabase에서 수리 요청 불러옴:', data?.length || 0, '개');
      
      // 🔥 새로운 테이블 구조에 맞게 데이터 매핑
      const formattedData = (data || []).map((item: any) => {
        try {
          return {
            id: item.id || 0,
            customer_name: item.customer_name || '이름 없음',
            customer_phone: item.customer_phone || '',
            customer_address: item.customer_address || '주소 정보 없음',
            customer_address_detail: item.customer_address_detail || undefined, // 상세주소 추가
            printer_model: item.printer_model || '-',
            symptoms: item.symptoms || [],
            visit_date: item.visit_date || '',
            visit_time: item.visit_time || '',
            total_price: item.total_price || 0,
            description: item.description || '',
            created_at: item.created_at || new Date().toISOString(),
            image_urls: item.image_urls || [],
            actual_distance: item.actual_distance || undefined, // 실제 거리 추가
          };
        } catch (mapError) {
          console.error('❌ 데이터 매핑 실패:', mapError, item);
          return null;
        }
      }).filter(Boolean);
      
      console.log('✅ 매핑된 데이터:', formattedData.length, '개');
      
      setRequests(formattedData);
    } catch (err) {
      console.error('❌ 데이터 조회 오류:', err);
      
      // ✅ 에러 메시지 안전하게 추출
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        // Supabase 에러 객체인 경우
        errorMessage = (err as any).message || (err as any).error_description || JSON.stringify(err);
      }
      
      setError(`데이터 조회 실패: ${errorMessage}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // 삭제 함수
  const deleteRequest = async (id: string) => {
    if (!confirm('이 수리 요청을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      console.log('🗑️ 수리 요청 삭제 시작:', id, typeof id);
      
      // 🔥 ID를 숫자로 변환 (DB는 BIGINT)
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        throw new Error('잘못된 ID 형식입니다.');
      }
      
      console.log('🔥 변환된 ID:', numericId, typeof numericId);
      
      const { error, data } = await supabase
        .from('printer_repair_requests')
        .delete()
        .eq('id', numericId)
        .select(); // 🔥 삭제된 데이터 반환
      
      if (error) {
        console.error('❌ Supabase 삭제 실패:', error);
        console.error('❌ 에러 코드:', error.code);
        console.error('❌ 에러 메시지:', error.message);
        console.error('❌ 에러 상세:', error.details);
        
        // RLS 정책 에러 체크
        if (error.code === '42501' || error.message.includes('policy')) {
          alert(`❌ 삭제 권한이 없습니다.\n\n해결 방법:\n1. Supabase 대시보드 접속\n2. Authentication → Policies 메뉴\n3. printer_repair_requests 테이블에 DELETE 정책 추가\n\n또는 RLS를 일시적으로 비활성화하세요.`);
        } else {
          alert(`❌ 삭제 실패: ${error.message}`);
        }
        
        throw error;
      }
      
      console.log('✅ Supabase에서 삭제 완료:', data);
      console.log('✅ 수리 요청 삭제 완료:', id);
      
      // 🔥 UI에서 즉시 제거 (새로고침 없이)
      setRequests(prevRequests => prevRequests.filter(req => req.id.toString() !== id));
      
      alert('✅ 수리 요청이 삭제되었습니다.');
      
      // 🔥 모달이 열려있으면 닫기
      if (showDetailModal && selectedRequest?.id.toString() === id) {
        setShowDetailModal(false);
        setSelectedRequest(null);
      }
      
      // 🔥 완료 목록에서도 제거
      const newCompleted = new Set(completedRequests);
      newCompleted.delete(id);
      setCompletedRequests(newCompleted);
      localStorage.setItem("booscatch_completed_requests", JSON.stringify([...newCompleted]));
      
    } catch (err: any) {
      console.error('❌ 삭제 오류:', err);
      
      // 이 alert를 표시하지 않았다면 표시
      if (!err.message?.includes('policy') && !err.code) {
        alert(`삭제 중 오류가 발생했습니다.\n\n상세: ${err.message || err}`);
      }
    }
  };

  // 모든 데이터 삭제
  const deleteAllRequests = async () => {
    if (!confirm('⚠️ 정말로 모든 수리 요청을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다!')) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      console.log('🗑️ 모든 수리 요청 삭제 시작...');
      
      // 현재 개수 확인
      const { count } = await supabase
        .from('printer_repair_requests')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 삭제할 항목 수:', count);
      
      // 모든 데이터 삭제
      const { error, data } = await supabase
        .from('printer_repair_requests')
        .delete()
        .neq('id', 0) // 모든 레코드 삭제 (id != 0 조건)
        .select(); // 삭제된 데이터 반환
      
      if (error) {
        console.error('❌ 전체 삭제 실패:', error);
        
        // RLS 정책 에러 체크
        if (error.code === '42501' || error.message.includes('policy')) {
          alert(`❌ 삭제 권한이 없습니다.\n\n해결 방법:\n1. Supabase 대시보드 접속\n2. Authentication → Policies 메뉴\n3. printer_repair_requests 테이블에 DELETE 정책 추가\n\n또는 RLS를 일시적으로 비활성화하세요.`);
        } else {
          alert(`❌ 삭제 실패: ${error.message}`);
        }
        
        throw error;
      }
      
      console.log('✅ 모든 수리 요청 삭제 완료:', data?.length, '개');
      
      // 🔥 UI에서 즉시 모두 제거
      setRequests([]);
      
      // 🔥 완료 목록도 초기화
      setCompletedRequests(new Set());
      localStorage.setItem("booscatch_completed_requests", JSON.stringify([]));
      
      alert(`✅ 모든 수리 요청이 삭제되었습니다. (${count || data?.length || 0}건)`);
      
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedRequest(null);
      }
    } catch (err: any) {
      console.error('❌ 전체 삭제 오류:', err);
      
      if (!err.message?.includes('policy') && !err.code) {
        alert(`삭제 중 오류가 발생했습니다.\n\n상세: ${err.message || err}`);
      }
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchRequests();
    loadServiceFees();
    
    // 🔥 Supabase Realtime 구독
    const supabase = getSupabaseClient();
    
    console.log('📡 Supabase Realtime 구독 시작...');
    
    const channel = supabase
      .channel('printer_repair_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'printer_repair_requests'
        },
        (payload) => {
          console.log('🔔 Realtime 이벤트 감지:', payload);
          
          // 데이터 다시 불러오기
          fetchRequests();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime 구독 상태:', status);
      });
    
    // 클업
    return () => {
      console.log('🔌 Realtime 구독 해제');
      supabase.removeChannel(channel);
    };
  }, []);

  // 검색 필터링
  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.customer_name.toLowerCase().includes(term) ||
      req.customer_phone.includes(term) ||
      req.customer_address.toLowerCase().includes(term) ||
      req.printer_model.toLowerCase().includes(term)
    );
  });

  const openDetailModal = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };
  
  // SMS 답장 링크 생성
  const generateSMSLink = (request: Request) => {
    const phone = request.customer_phone.replace(/-/g, '');
    
    // 증상 포맷팅
    const symptomsText = request.symptoms && request.symptoms.length > 0 
      ? request.symptoms.join(', ')
      : '정보 없음';
    
    const message = `안녕하세요, ENX 프린터입니다.

수리 요청 주셔서 감사합니다!

[프린터 정보]
• 기종: ${request.printer_model || '정보 없음'}
• 고장 증상: ${symptomsText}
${request.description ? `• 상세 내용: ${request.description}` : ''}

[수리 요청 정보]
• 고객명: ${request.customer_name}
• 방문일자: ${request.visit_date}
• 방문시간: ${request.visit_time || '-'}
• 방문주소: ${request.customer_address}

[출장비 안내]
💰 예상 출장 점검비: ${request.total_price.toLocaleString()}원

※ 위 금액은 출장 점검비이며, 
※ 부품 교체 비용은 현장 점검 후 별도 안내드립니다.

감사합니다.
ENX 프린터 드림`;
    
    const encodedMessage = encodeURIComponent(message);
    
    return `sms:${phone}?body=${encodedMessage}`;
  };
  
  // 🔥 사진 추출 함수
  const extractImages = (request: Request) => {
    // DB의 image_urls 필드 직접 사용
    const urls = request.image_urls || [];
    console.log('📸 이미지 URL 추출:', {
      고객명: request.customer_name,
      이미지_개수: urls.length,
      이미지_URLs: urls
    });
    return urls;
  };

  // 🔐 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-5 shadow-xl shadow-blue-200/50"
            >
              <Lock className="w-9 h-9 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">관리자 로그인</h1>
            <p className="text-sm text-gray-500">ENX 프린터 수리 접수 관리 시스템</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg tracking-widest"
                required
                autoFocus
              />
            </div>
            
            {passwordError && (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700 font-medium">{passwordError}</p>
              </motion.div>
            )}
            
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-200/50 active:scale-[0.97]"
            >
              로그인
            </button>
          </form>
          
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            메인으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  // Stats calculations
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => !completedRequests.has(r.id.toString())).length;
  const completedCount = requests.filter(r => completedRequests.has(r.id.toString())).length;
  const totalRevenue = requests.reduce((sum, r) => sum + (r.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-20"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900">관리자 대시보드</h1>
                <p className="text-[10px] text-gray-400 font-medium">ENX Printer Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRequests}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 disabled:opacity-50 text-sm font-bold active:scale-[0.97]"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{totalRequests}</p>
            <p className="text-[10px] text-gray-500">전체 접수</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Pending</span>
            </div>
            <p className="text-2xl font-black text-orange-600">{pendingRequests}</p>
            <p className="text-[10px] text-gray-500">대기중</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Done</span>
            </div>
            <p className="text-2xl font-black text-green-600">{completedCount}</p>
            <p className="text-[10px] text-gray-500">처리완료</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Revenue</span>
            </div>
            <p className="text-2xl font-black text-purple-600">{formatPriceInManwon(totalRevenue)}</p>
            <p className="text-[10px] text-gray-500">총 매출</p>
          </div>
        </motion.div>

        {/* PC에서는 세로 배치 */}
        <div className="flex flex-col gap-5">
          {/* 수리 접수 내역 (전체 너비) */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-blue-600" />
                    <h2 className="text-lg font-bold">수리 접수 내역</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {filteredRequests.length}건
                    </span>
                  </div>
                  {requests.length > 0 && (
                    <button
                      onClick={deleteAllRequests}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      전체 삭제
                    </button>
                  )}
                </div>

                {/* 검색 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="이름, 전화번호, 기종, 주소로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 수리 접수 목록 */}
              <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 transparent'
                }}
              >
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>데이터를 불러오는 중...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-600">
                    <p>{error}</p>
                    <button
                      onClick={fetchRequests}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">수리 요청이 없습니다.</p>
                  </div>
                ) : (
                  filteredRequests.map((req) => {
                    const isCompleted = completedRequests.has(req.id.toString());
                    const images = extractImages(req);
                    const hasImages = images.length > 0;
                    
                    return (
                    <div
                      key={req.id}
                      /* ✅ 1. 전체 박스 클릭 시 상세 모달 오픈 */
                      onClick={() => openDetailModal(req)}
                      className={`p-5 cursor-pointer transition-all border-l-4 hover:bg-gray-50/80 ${
                        isCompleted ? 'border-green-500 bg-green-50/30' : 'border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-black text-gray-900 text-lg">
                              {req.customer_name}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                DONE
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            {/* 프린터 기종 */}
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Printer className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold">{req.printer_model || '-'}</span>
                            </div>
                            
                            {/* 증상 */}
                            {req.symptoms && req.symptoms.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                                <Wrench className="w-3.5 h-3.5" />
                                <span>{req.symptoms.join(', ')}</span>
                              </div>
                            )}
                            
                            {/* 주소 */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[200px]">{req.customer_address}</span>
                            </div>
                          </div>

                          {/* 사진 썸네일 */}
                          {hasImages && (
                            <div className="flex items-center gap-1.5 mt-3">
                              {images.slice(0, 4).map((url, idx) => (
                                <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                                  <img src={url} className="w-full h-full object-cover" alt="첨부" />
                                </div>
                              ))}
                              {images.length > 4 && (
                                <div className="text-[10px] font-bold text-gray-400 ml-1">+{images.length - 4}</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ✅ 2. 오른쪽 가격 및 완료 버튼 영역 */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold leading-none mb-1">TOTAL AMOUNT</p>
                            <p className="font-black text-blue-600 text-lg leading-none">
                              {formatPriceInManwon(req.total_price)}
                            </p>
                          </div>
                          
                          {/* 완료 버튼 (이 버튼만은 버블링을 막아 완료 상태만 토글하게 함) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // ✅ 카드 클릭 이벤트가 발생하지 않도록 차단
                              toggleCompleted(req.id.toString());
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                              isCompleted 
                                ? 'bg-gray-100 text-gray-400' 
                                : 'bg-orange-500 text-white shadow-orange-100'
                            }`}
                          >
                            {isCompleted ? '취소' : '완료처리'}
                          </button>
                        </div>
                      </div>

                      {/* 하단 날짜 정보 */}
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{req.visit_date} {req.visit_time}</span>
                        </div>
                        <div className="text-[10px] text-gray-300 font-medium italic">
                          ID: {req.id.toString().slice(-4)}
                        </div>
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </div>
          </motion.div>

          {/* 설정 영역들 - PC에서 가로 2칸 배치 */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* 출장비 기본 설정 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-bold">출장비 기본 설정</h2>
                </div>
                <button
                  onClick={() => {
                    if (editingFees) {
                      saveServiceFees();
                    } else {
                      setEditingFees(true);
                    }
                  }}
                  className={`text-sm px-4 py-2 rounded-xl transition-colors font-medium ${
                    editingFees 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {editingFees ? '💾 저장' : '✏️ 편집'}
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                {/* 서울·경기·인천 기본료 */}
                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">서울·경기·인천 기본료</span>
                    {editingFees ? (
                      <input
                        type="number"
                        value={serviceFees.baseMetro}
                        onChange={(e) => setServiceFees({...serviceFees, baseMetro: parseInt(e.target.value) || 0})}
                        className="w-32 px-2 py-1.5 text-right border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                        step="10000"
                      />
                    ) : (
                      <span className="font-bold text-blue-600">{formatPriceInManwon(serviceFees.baseMetro)}</span>
                    )}
                  </div>
                </div>
                
                {/* km당 추가 요금 */}
                <div className="p-3 bg-orange-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">지방 km당 추가 요금</span>
                    {editingFees ? (
                      <input
                        type="number"
                        value={serviceFees.kmRate}
                        onChange={(e) => setServiceFees({...serviceFees, kmRate: parseInt(e.target.value) || 0})}
                        className="w-32 px-2 py-1.5 text-right border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold text-orange-600"
                        step="100"
                      />
                    ) : (
                      <span className="font-bold text-orange-600">{serviceFees.kmRate.toLocaleString()}원/km</span>
                    )}
                  </div>
                </div>
              </div>
              
              {editingFees && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">✏️ 편집 모드:</span> 금액을 직접 입력하세요.
                  </p>
                </div>
              )}
            </div>
            
            {/* 수리 불가능 날짜 관리 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-bold">예약 불가 날짜</h2>
              </div>

              <p className="text-xs text-gray-600 mb-4">
                달력에서 날짜를 클릭하여 예약 불가능 날짜로 설정하세요.
              </p>

              {/* 달력 UI */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="font-semibold text-gray-900">
                    {currentMonth.toLocaleString('ko-KR', { year: 'numeric', month: 'long' })}
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-600 text-center py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDates().map((date, idx) => {
                    const getLocalDateString = (d: Date) => {
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    };
                    
                    const isDisabled = date && disabledDates.includes(getLocalDateString(date));
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = date && date < today;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => date && handleDateClick(date)}
                        disabled={!date}
                        className={`
                          aspect-square p-2 rounded-xl text-sm transition-colors font-medium
                          ${!date ? 'invisible' : ''}
                          ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                          ${isDisabled && !isPast ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                          ${!isDisabled && !isPast ? 'bg-gray-50 hover:bg-gray-200 text-gray-900' : ''}
                        `}
                      >
                        {date ? date.getDate() : ''}
                      </button>
                    );
                  })}
                </div>
                
                {/* 내 메시지 */}
                <div className="mt-3 p-2 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 text-center">
                    <span className="text-red-500">■</span> 예약 불가 날짜 | 
                    <span className="text-gray-400"> ■</span> 지난 날짜
                  </p>
                </div>
              </div>
              
              {/* 저장 버튼 */}
              <div className="mt-6">
                <button
                  onClick={saveDisabledDates}
                  disabled={isSaving}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all shadow-lg ${
                    isSaving ? 'bg-gray-400 text-gray-100 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      💾 예약 불가 날짜 저장
                    </>
                  )}
                </button>
              </div>
              
              {/* 비활성화된 날짜 목록 */}
              {disabledDates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    예약 불가 날짜 ({disabledDates.length}개)
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {disabledDates
                      .sort()
                      .reverse()
                      .map((date, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-red-50 px-3 py-2 rounded-xl"
                        >
                          <span className="font-medium text-red-900">
                            {new Date(date + 'T00:00:00').toLocaleDateString("ko-KR", {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <button
                            onClick={() => handleDateRemove(date)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-colors"
                            title="제"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 상세 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 p-5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-black text-gray-900">수리 요청 상세</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteRequest(selectedRequest.id.toString())}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 🔥 1. 고객 정보 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  고객 정보
                </h3>
                <div className="space-y-3">
                  {/* 고객명 */}
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">고객명</div>
                    <div className="font-semibold">{selectedRequest.customer_name}</div>
                  </div>
                  
                  {/* 연락처 */}
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">연락처</div>
                    <div className="font-semibold text-blue-600">
                      {selectedRequest.customer_phone}
                    </div>
                  </div>
                  
                  {/* 방문 주소 */}
                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      방문 주소
                    </div>
                    <div className="font-medium text-gray-800 whitespace-pre-line">
                      {selectedRequest.customer_address}
                      {selectedRequest.customer_address_detail && (
                        <div className="text-sm text-gray-700 mt-1">
                          {selectedRequest.customer_address_detail}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 방문 일시 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="text-xs text-gray-600 mb-1">방문 날짜</div>
                      <div className="font-semibold text-purple-800">{selectedRequest.visit_date}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="text-xs text-gray-600 mb-1">방문 시간</div>
                      <div className="font-semibold text-purple-800">{selectedRequest.visit_time || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔥 2. 프린터 정보 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  프린터 정보
                </h3>
                <div className="space-y-3">
                  {/* 프린터 기종 */}
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">기종</div>
                    <div className="font-medium text-gray-800">
                      {selectedRequest.printer_model || '-'}
                    </div>
                  </div>
                  
                  {/* 고장 증상 */}
                  <div>
                    <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      고장 증상
                    </div>
                    {selectedRequest.symptoms && selectedRequest.symptoms.length > 0 ? (
                      <div className="p-4 bg-orange-50 rounded-xl space-y-2">
                        {selectedRequest.symptoms.map((symptom, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="font-medium text-orange-800">{symptom}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-500 text-sm">
                        선택된 증상 없음
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🔥 3. 상세 고장 내용 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  상세 고장 내용
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-800 whitespace-pre-line">
                    {(() => {
                      const detailsText = selectedRequest.description;
                      const imageInfoMatch = detailsText.match(/📷 \[이미지 정보\]\n([\s\S]*)/);
                      
                      let mainDetails = detailsText;
                      if (imageInfoMatch) {
                        mainDetails = detailsText.substring(0, imageInfoMatch.index);
                      }
                      
                      return mainDetails || '상세 내용 없음';
                    })()}
                  </div>
                </div>
              </div>

              {/* 첨부 사진/동영상 */}
              {(() => {
                const images = extractImages(selectedRequest);
                
                console.log('🖼️ 관리자 모달 - 미디어 URL 확인:', images);
                console.log('🖼️ 관리자 모달 - 미디어 개수:', images.length);
                
                if (images.length === 0) {
                  return (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        📸 첨부 사진/영상
                      </h3>
                      <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">고객이 사진을 첨부하지 않았습니다</p>
                        <p className="text-xs text-gray-400 mt-1">전화 문의 시 추가로 요청하세요</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      📸 첨부 사진/영상 ({images.length}개)
                    </h3>
                    
                    {/* 사진/영상 그리드 */}
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((url: string, idx: number) => {
                        // 🎬 파일 확장자로 동영상 여부 판별
                        const isVideo = /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);
                        
                        console.log(`🖼️ 미디어 ${idx + 1} 렌더링:`, url, '동영상:', isVideo);
                        
                        if (isVideo) {
                          // 🎬 동영상인 경우 <video> 태그 사용
                          return (
                            <div
                              key={idx}
                              className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl border-2 border-purple-200"
                            >
                              <video
                                src={url}
                                controls
                                className="w-full aspect-square object-cover"
                                style={{ maxHeight: '400px', borderRadius: '8px' }}
                                onError={(e) => {
                                  console.error(`❌ 동영상 로드 실패 (${idx + 1}):`, url);
                                  const target = e.target as HTMLVideoElement;
                                  target.style.display = 'none';
                                  // 에러 메시지 표시
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <p class="text-red-500 font-medium mb-2">🎬 동영상을 불러올 수 없습니다</p>
                                        <a href="${url}" target="_blank" class="text-blue-600 underline text-sm">링크에서 직접 보기</a>
                                      </div>
                                    `;
                                  }
                                }}
                                onLoadedData={() => {
                                  console.log(`✅ 동영상 로드 성공 (${idx + 1}):`, url);
                                }}
                              />
                              <div className="absolute bottom-2 right-2 bg-purple-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                                🎬 영상 {idx + 1}
                              </div>
                            </div>
                          );
                        } else {
                          // 📸 이미지인 경우 <img> 태그 사용
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity shadow-md hover:shadow-xl border-2 border-gray-200 group"
                            >
                              <img
                                src={url}
                                alt={`사진 ${idx + 1}`}
                                className="w-full aspect-square object-cover"
                                onError={(e) => {
                                  console.error(`❌ 이미지 로드 실패 (${idx + 1}):`, url);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  // 에러 메시지 표시
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center p-4 text-center">
                                        <p class="text-gray-500 font-medium text-sm">이미지를 불러올 수 없습니다</p>
                                      </div>
                                    `;
                                  }
                                }}
                                onLoad={() => {
                                  console.log(`✅ 이미지 로드 성공 (${idx + 1}):`, url);
                                }}
                              />
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded group-hover:bg-opacity-90 transition-all">
                                🔍 사진 {idx + 1}
                              </div>
                            </a>
                          );
                        }
                      })}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      💡 이미지를 클릭하면 새 탭에서 원본 사이즈로 볼 수 있습니다
                    </p>
                  </div>
                );
              })()}

              {/* 출장비 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl border-2 border-blue-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  예상 출장 점검비
                  {selectedRequest.actual_distance && selectedRequest.actual_distance > 0 && (
                    <span className="text-xs font-normal text-gray-600 ml-auto">
                      📏 실제 거리: {selectedRequest.actual_distance.toFixed(1)}km
                    </span>
                  )}
                </h3>
                <div className="text-3xl font-bold text-blue-600">
                  {formatPriceInManwon(selectedRequest.total_price)}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ※ 부품 교체 비용은 현장 점검 후 별도 안내됩니다
                </p>
              </div>

              {/* 🔥 전화/문자 버튼 - 제일 하단 배치 */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:${selectedRequest.customer_phone}`}
                  className="flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  전화하기
                </a>
                
                <a
                  href={generateSMSLink(selectedRequest)}
                  className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" />
                  문자전송
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}