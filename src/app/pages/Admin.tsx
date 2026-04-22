import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  FileText,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Eye,
  Trash2,
  Download,
  Phone,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  X,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { QuotationData } from '../components/QuotationForm';
import { PricingSettings } from '../components/PricingSettings';
import TermsEditor from '../components/TermsEditor';
import EmailSettings from '../components/EmailSettings';
import { getPricingConfig } from '../utils/pricingConfig';
import {
  getAllQuotations,
  deleteQuotation,
  deleteAllQuotations,
  migrateFromLocalStorage,
  SupabaseQuotation,
} from '../utils/supabaseClient';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Admin Dashboard - Premium v2
 * - Glassmorphism stat cards with animated gradients
 * - Modern tab navigation with underline indicator
 * - Enhanced quotation list with status badges
 * - Animated modal with backdrop blur
 * - Better data visualization
 */

interface SavedQuotation {
  id: string;
  data: QuotationData;
  createdAt: string;
  status: 'pending' | 'signed' | 'submitted';
  signature?: string;
  signedAt?: string;
  submittedAt?: string;
}

type TabType = 'overview' | 'settings' | 'terms';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [quotations, setQuotations] = useState<SavedQuotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<SavedQuotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setIsLoading(true);
    try {
      const supabaseData = await getAllQuotations();
      const converted: SavedQuotation[] = supabaseData.map((sq: SupabaseQuotation) => ({
        id: sq.id,
        data: sq.quotation_data || {
          companyName: sq.company_name,
          contactName: sq.contact_name,
          phone: sq.phone,
          email: sq.email,
          printerModel: sq.printer_model,
          quantity: sq.quantity,
          rentalPeriod: sq.rental_period,
          usage: sq.usage,
          printTypes: sq.print_types,
          dailyPrintQuantity: sq.daily_print_quantity,
          address: sq.address,
          detailedAddress: sq.detailed_address,
        },
        createdAt: sq.created_at,
        status: sq.status,
        signature: sq.signature,
        signedAt: sq.signed_at,
        submittedAt: sq.submitted_at,
      }));
      setQuotations(converted);
    } catch (error) {
      console.error('❌ 견적서 불러오기 실패:', error);
      toast.error('견적서를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    if (!confirm('localStorage의 데이터를 Supabase로 마이그레이션하시겠습니까?')) return;
    setIsMigrating(true);
    try {
      await migrateFromLocalStorage();
      toast.success('마이그레이션이 완료되었습니다!');
      await loadQuotations();
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      toast.error('마이그레이션에 실패했습니다.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 견적서를 삭제하시겠습니까?')) {
      try {
        await deleteQuotation(id);
        setQuotations(quotations.filter((q) => q.id !== id));
        if (selectedQuotation?.id === id) setSelectedQuotation(null);
        toast.success('견적서가 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 삭제 실패:', error);
        toast.error('삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (quotations.length === 0) {
      alert('삭제할 견적서가 없습니다.');
      return;
    }
    if (confirm(`정말로 모든 견적서 ${quotations.length}건을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await deleteAllQuotations();
        setQuotations([]);
        setSelectedQuotation(null);
        toast.success('모든 견적서가 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 전체 삭제 실패:', error);
        toast.error('삭제에 실패했습니다.');
      }
    }
  };

  const exportToCSV = () => {
    if (quotations.length === 0) {
      alert('내보낼 견적서가 없습니다.');
      return;
    }
    const headers = ['견적서 ID', '회사명', '담당자', '연락처', '프린터 모델', '렌탈 기간', '작성일', '상태'];
    const rows = quotations.map((q) => [
      q.id,
      q.data.companyName,
      q.data.contactName,
      q.data.phone,
      q.data.printerModel,
      q.data.rentalPeriod,
      format(new Date(q.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko }),
      q.status === 'signed' || q.status === 'submitted' ? '서명완료' : '대기중',
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `견적서_목록_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const totalQuotations = quotations.length;
  const signedQuotations = quotations.filter((q) => q.status === 'signed' || q.status === 'submitted').length;
  const pendingQuotations = quotations.filter((q) => q.status === 'pending').length;
  const customers = Array.from(
    new Map(quotations.map((q) => [q.data.companyName, { companyName: q.data.companyName, contactName: q.data.contactName, phone: q.data.phone }])).values()
  );

  const config = getPricingConfig();
  const printerModels = [
    { id: 'Epson-3156-A4', name: 'Epson 3156 A4', pricing: config.models.epson3156A4, installationFee: 150000 },
    { id: 'Epson-1390-A3', name: 'Epson 1390 A3', pricing: config.models.epson1390A3, installationFee: 170000 },
    { id: 'Epson-3880-P800-A2', name: 'Epson 3880/P800 A2', pricing: config.models.epson3880P800A2, installationFee: 170000 },
  ];

  const calculateMonthlyPrice = (pricing: any, rentalPeriod: number): number => {
    if (rentalPeriod === 1) return Math.round(pricing.threeMonths * 1.35);
    else if (rentalPeriod >= 12) return pricing.twelveMonths;
    else if (rentalPeriod >= 6) return pricing.sixMonths;
    else return pricing.threeMonths;
  };

  const totalRevenue = quotations
    .filter((q) => q.status === 'signed' || q.status === 'submitted')
    .reduce((sum, q) => {
      const model = printerModels.find((m) => m.id === q.data.printerModel);
      if (model) {
        const monthlyPrice = calculateMonthlyPrice(model.pricing, q.data.rentalPeriod);
        return sum + monthlyPrice * q.data.quantity * q.data.rentalPeriod;
      }
      return sum;
    }, 0);

  const tabs = [
    { id: 'overview' as TabType, label: '전체 현황', icon: BarChart3 },
    { id: 'settings' as TabType, label: '시스템 설정', icon: Settings },
    { id: 'terms' as TabType, label: '약관 관리', icon: FileText },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: '전송완료', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      case 'signed':
        return { label: '서명완료', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      default:
        return { label: '대기중', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-6 pb-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">관리자 대시보드</h1>
                <p className="text-xs text-white/70 font-medium mt-0.5">MacaPrint Admin</p>
              </div>
            </div>
            <button
              onClick={loadQuotations}
              disabled={isLoading}
              className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-all active:scale-90 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: '전체 견적', value: totalQuotations, icon: FileText, gradient: 'from-blue-500 to-cyan-400', lightBg: 'bg-blue-50' },
                  { title: '서명 완료', value: signedQuotations, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-400', lightBg: 'bg-emerald-50' },
                  { title: '대기 중', value: pendingQuotations, icon: Clock, gradient: 'from-amber-500 to-orange-400', lightBg: 'bg-amber-50' },
                  { title: '고객 수', value: customers.length, icon: Users, gradient: 'from-purple-500 to-pink-400', lightBg: 'bg-purple-50' },
                ].map((stat, i) => {
                  const IconComponent = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group"
                    >
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-[0.07] rounded-bl-full -mr-4 -mt-4`} />
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center mb-3 shadow-sm`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                      <p className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">{stat.value}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Revenue Card */}
              {totalRevenue > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/70 font-bold uppercase tracking-wider">예상 매출</p>
                      <p className="text-2xl font-black mt-1">{totalRevenue.toLocaleString()}원</p>
                    </div>
                    <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quotation List */}
              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900">최근 견적 목록</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      CSV
                    </button>
                    {quotations.length > 0 && (
                      <button
                        onClick={handleDeleteAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        전체삭제
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {quotations.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-semibold">견적서가 없습니다</p>
                      <p className="text-xs text-gray-300 mt-1">새로운 견적서가 접수되면 여기에 표시됩니다</p>
                    </div>
                  ) : (
                    quotations.slice(0, 15).map((q, idx) => {
                      const statusConfig = getStatusConfig(q.status);
                      return (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => setSelectedQuotation(q)}
                          className="flex items-center justify-between px-5 py-4 hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-1.5 h-10 rounded-full ${statusConfig.dot} flex-shrink-0`} />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                {q.data.companyName}
                              </h4>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {q.data.contactName} · {q.data.printerModel?.replace('Epson-', '').replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            <div className="text-right">
                              <p className="text-xs font-semibold text-gray-500">
                                {format(new Date(q.createdAt), 'MM/dd HH:mm')}
                              </p>
                              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedQuotation(q); }}
                                className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  데이터 관리
                </h3>
                <button
                  onClick={loadQuotations}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 로딩 중...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> 데이터 새로고침</>
                  )}
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  가격 설정
                </h3>
                <PricingSettings />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  이메일 설정
                </h3>
                <EmailSettings />
              </div>
            </motion.div>
          )}

          {/* Terms Tab */}
          {activeTab === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  약관 및 정책 관리
                </h3>
                <TermsEditor />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal - Enhanced */}
      <AnimatePresence>
        {selectedQuotation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 rounded-t-3xl z-10">
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">견적서 상세</h3>
                    <p className="text-xs text-gray-400 mt-0.5">#{selectedQuotation.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedQuotation(null)}
                    className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Status Badge */}
                {(() => {
                  const statusConfig = getStatusConfig(selectedQuotation.status);
                  return (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                      <span className={`text-xs font-bold ${statusConfig.text}`}>{statusConfig.label}</span>
                    </div>
                  );
                })()}

                {/* Customer Info */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">고객 정보</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                    {[
                      { label: '회사명', value: selectedQuotation.data.companyName },
                      { label: '담당자', value: selectedQuotation.data.contactName },
                      { label: '연락처', value: selectedQuotation.data.phone },
                      { label: '이메일', value: selectedQuotation.data.email },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rental Info */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">렌탈 정보</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                    {[
                      { label: '프린터 모델', value: selectedQuotation.data.printerModel },
                      { label: '수량', value: `${selectedQuotation.data.quantity}대` },
                      { label: '렌탈 기간', value: `${selectedQuotation.data.rentalPeriod}개월` },
                      ...(selectedQuotation.data.usage ? [{ label: '사용 용도', value: Array.isArray(selectedQuotation.data.usage) ? selectedQuotation.data.usage.join(', ') : selectedQuotation.data.usage }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Info */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">금액 정보</h4>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    {(() => {
                      const model = printerModels.find((m) => m.id === selectedQuotation.data.printerModel);
                      if (!model) return <div className="text-red-500 text-sm">모델 정보를 찾을 수 없습니다.</div>;
                      const baseMonthlyPrice = calculateMonthlyPrice(model.pricing, selectedQuotation.data.rentalPeriod);
                      const totalPrice = baseMonthlyPrice * selectedQuotation.data.rentalPeriod * selectedQuotation.data.quantity;
                      const vat = Math.round(totalPrice * 0.1);
                      const totalWithVAT = totalPrice + vat + model.installationFee;

                      return (
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">월 렌탈료</span>
                            <span className="text-sm font-semibold text-gray-900">{baseMonthlyPrice.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">총 렌탈료 ({selectedQuotation.data.rentalPeriod}개월)</span>
                            <span className="text-sm font-semibold text-gray-900">{totalPrice.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">부가세 (10%)</span>
                            <span className="text-sm font-semibold text-gray-900">{vat.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">설치비</span>
                            <span className="text-sm font-semibold text-gray-900">{model.installationFee.toLocaleString()}원</span>
                          </div>
                          <div className="border-t border-indigo-200 pt-2.5 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900">총 금액</span>
                            <span className="text-lg font-black text-indigo-600">{totalWithVAT.toLocaleString()}원</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Date Info */}
                <div className="text-xs text-gray-400">
                  작성일: {format(new Date(selectedQuotation.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                </div>

                {/* Signature */}
                {selectedQuotation.signature && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">전자 서명</h4>
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-center">
                      <img src={selectedQuotation.signature} alt="서명" className="h-20 border border-gray-200 rounded-lg bg-white p-2" />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${selectedQuotation.data.phone}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    전화
                  </a>
                  <a
                    href={`sms:${selectedQuotation.data.phone}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    문자
                  </a>
                </div>

                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
