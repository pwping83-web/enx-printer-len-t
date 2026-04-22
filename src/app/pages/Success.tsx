import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle2, Home, Printer, Download, FileText, PartyPopper, Sparkles, ArrowRight } from 'lucide-react';
import { SignedQuotation } from '../components/SignedQuotation';
import { PDFQuotation } from '../components/PDFQuotation';
import { QuotationData } from '../components/QuotationForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'motion/react';

/**
 * Success Page Component - Premium v2
 * - Celebration animation with confetti-like effects
 * - Animated checkmark with ring pulse
 * - Timeline-style info display
 * - Premium action buttons with hover effects
 * - PDF save with enhanced error handling
 */
export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [quotationId, setQuotationId] = useState<string>('');
  const [isSavingPDF, setIsSavingPDF] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { quotationData: data, signature: sig, quotationId: id } = location.state as {
        quotationData: QuotationData;
        signature: string;
        quotationId: string;
      };
      if (data && sig) {
        setQuotationData(data);
        setSignature(sig);
        setQuotationId(id || '');
        return;
      }
    }

    const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
    const latestQuotation = savedQuotations[savedQuotations.length - 1];
    if (latestQuotation) {
      setQuotationData(latestQuotation.data);
      setSignature(latestQuotation.signature || '');
      setQuotationId(latestQuotation.id || '');
    } else {
      navigate('/');
    }
  }, [navigate, location]);

  const handleReset = () => navigate('/custom');
  const handleGoHome = () => navigate('/');

  const handleSaveAsPDF = async () => {
    const element = document.getElementById('quotation-to-save');
    if (!element || !quotationData) return;

    setIsSavingPDF(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Only remove Tailwind/app stylesheets, keep font-face declarations
          const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          stylesheets.forEach((sheet) => {
            const href = (sheet as HTMLLinkElement).href || '';
            // Keep font CDN stylesheets (Pretendard, Google Fonts, etc.)
            if (!href.includes('fonts') && !href.includes('pretendard')) {
              sheet.remove();
            }
          });
          // Remove app style tags but keep @font-face declarations
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((tag) => {
            const content = tag.textContent || '';
            if (!content.includes('@font-face')) {
              tag.remove();
            }
          });

          const body = clonedDoc.body;
          if (body) { body.className = ''; body.style.cssText = 'background: #ffffff; margin: 0; padding: 0;'; }
          const html = clonedDoc.documentElement;
          if (html) { html.className = ''; html.style.cssText = 'background: #ffffff;'; }
          const clonedElement = clonedDoc.getElementById('quotation-to-save');
          if (clonedElement) {
            clonedElement.style.cssText = 'background-color: #ffffff; width: 794px; padding: 0; margin: 0;';
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => { if (el instanceof HTMLElement) el.className = ''; });
          }

          // Inject fallback Korean font style to ensure proper rendering
          const fontStyle = clonedDoc.createElement('style');
          fontStyle.textContent = `
            * { font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif !important; }
          `;
          clonedDoc.head.appendChild(fontStyle);
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const maxContentHeight = pageHeight - (margin * 2);
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > maxContentHeight) {
        const scaleFactor = maxContentHeight / imgHeight;
        imgHeight = maxContentHeight;
        const scaledImgWidth = imgWidth * scaleFactor;
        const xOffset = (imgWidth - scaledImgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, margin, scaledImgWidth, imgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, margin, imgWidth, imgHeight);
      }

      const fileName = `견적서_${quotationData.companyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      alert('PDF 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingPDF(false);
    }
  };

  if (!quotationData) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 relative overflow-hidden">
      {/* Floating celebration particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '100vh', x: `${15 + i * 15}%`, opacity: 0 }}
            animate={{ y: '-20vh', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4 + i * 0.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 3 }}
            className={`absolute w-3 h-3 rounded-full ${
              ['bg-pink-400', 'bg-indigo-400', 'bg-purple-400', 'bg-amber-400', 'bg-emerald-400', 'bg-cyan-400'][i]
            }`}
            style={{ filter: 'blur(1px)' }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 pb-24">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Success Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center pt-4"
          >
            {/* Animated Checkmark */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              {/* Pulse ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 w-24 h-24 rounded-full border-4 border-emerald-400"
              />
              {/* Decorative sparkles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-amber-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-1 -left-3"
              >
                <PartyPopper className="w-5 h-5 text-pink-400" />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-gray-900 mb-2"
            >
              전송 완료!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-500 leading-relaxed"
            >
              견적서가 관리자에게 성공적으로 전송되었습니다.
              <br />
              빠른 시간 내 상담 연락드리겠습니다.
            </motion.p>
          </motion.div>

          {/* Info Timeline Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {/* Summary Card */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">견적서 요약</h3>
                  <p className="text-[10px] text-gray-400">#{quotationId}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: '회사명', value: quotationData.companyName },
                  { label: '담당자', value: quotationData.contactName },
                  { label: '프린터', value: quotationData.printerModel?.replace('Epson-', '').replace('-', ' / ') },
                  { label: '렌탈 기간', value: `${quotationData.rentalPeriod}개월` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 text-xs">{item.label}</span>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
                {quotationData.totalPrice && (
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">총 금액</span>
                    <span className="text-lg font-black text-indigo-600">{quotationData.totalPrice.toLocaleString()}원</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100/50">
              <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                다음 단계
              </h3>
              <div className="space-y-3">
                {[
                  { num: '1', text: '관리자가 견적서를 검토합니다' },
                  { num: '2', text: '확인 후 상담 연락을 드립니다' },
                  { num: '3', text: '프린터 설치 일정을 조율합니다' },
                ].map((item) => (
                  <div key={item.num} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{item.num}</span>
                    </div>
                    <span className="text-xs text-indigo-800 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => window.print()}
                className="py-3.5 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                인쇄
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveAsPDF}
                disabled={isSavingPDF}
                className="py-3.5 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingPDF ? (
                  <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> 저장중</>
                ) : (
                  <><Download className="w-4 h-4" /> 저장</>
                )}
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="group w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative flex items-center gap-2">
                새 견적서 작성
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <button
              onClick={handleGoHome}
              className="w-full py-3 px-6 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </button>
          </motion.div>
        </div>
      </div>

      {/* Hidden PDF quotation */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
        <div id="quotation-to-save" style={{ backgroundColor: '#ffffff', width: '794px' }}>
          <PDFQuotation data={quotationData} signature={signature} />
        </div>
      </div>
    </div>
  );
}