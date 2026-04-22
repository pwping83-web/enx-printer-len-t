import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import QuotationForm, { QuotationData } from '../components/QuotationForm';
import { QuotationPreview } from '../components/QuotationPreview';
import { SignatureDialog } from '../components/SignatureDialog';
import { SignedQuotation } from '../components/SignedQuotation';
import { TermsAgreement } from '../components/ContractTerms';
import { sendTelegramNotification } from '../utils/telegramNotification';
import { sendSignatureEmail, resetCustomerInfoEmailFlag } from '../utils/emailNotification';
import { getPricingConfig } from '../utils/pricingConfig';
import { saveQuotation, updateQuotation, SupabaseQuotation } from '../utils/supabaseClient';
import { FileText, PenTool, CheckCircle2, Send, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { PDFQuotation } from '../components/PDFQuotation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Custom Page Component - Premium v2
 * - Enhanced step progress with animated connector lines
 * - Smooth page transitions between steps
 * - Floating action buttons with glow
 * - Better visual hierarchy
 */

type Step = 'form' | 'preview' | 'signed';

export default function Custom() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null);
  const [currentQuotationId, setCurrentQuotationId] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingPDF, setIsSavingPDF] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  // Check terms visibility setting
  useEffect(() => {
    const visibility = localStorage.getItem('terms_visibility');
    if (visibility !== null) {
      setTermsVisible(visibility === 'true');
    } else {
      setTermsVisible(false);
      localStorage.setItem('terms_visibility', 'false');
    }

    const handleTermsUpdate = () => {
      const newVisibility = localStorage.getItem('terms_visibility');
      if (newVisibility !== null) {
        setTermsVisible(newVisibility === 'true');
      }
    };

    window.addEventListener('contractTermsUpdated', handleTermsUpdate);
    return () => window.removeEventListener('contractTermsUpdated', handleTermsUpdate);
  }, []);

  const handleFormSubmit = async (data: QuotationData) => {
    setQuotationData(data);
    setStep('preview');
    setTermsAgreed(!termsVisible);

    const isPurchase = data.transactionType === 'purchase';
    let monthlyPrice = 0;
    let grandTotal = 0;

    if (isPurchase) {
      // 구매 특가: 200만원 × 수량, 설치비 없음
      const PURCHASE_PRICE = 2000000;
      grandTotal = PURCHASE_PRICE * data.quantity;
    } else {
      const config = getPricingConfig();
      const printerModels = [
        { id: 'Epson-3156-A4', pricing: config.models.epson3156A4 },
        { id: 'Epson-1390-A3', pricing: config.models.epson1390A3 },
        { id: 'Epson-3880-P800-A2', pricing: config.models.epson3880P800A2 },
      ];

      const selectedModel = printerModels.find(m => m.id === data.printerModel);
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

      monthlyPrice = baseMonthlyPrice;
      const totalMonthlyPrice = monthlyPrice * data.quantity;
      const totalRentalCost = totalMonthlyPrice * data.rentalPeriod;

      const installationFees: Record<string, number> = {
        'Epson-3156-A4': 150000,
        'Epson-1390-A3': 170000,
        'Epson-3880-P800-A2': 170000,
      };
      const installationFee = installationFees[data.printerModel] || 170000;
      const appliedInstallationFee = data.includeInstallationFee === false ? 0 : installationFee;
      grandTotal = totalRentalCost + appliedInstallationFee;
    }

    const quotationForSave = {
      id: `Q-${Date.now()}`,
      company_name: data.companyName,
      contact_name: data.contactName,
      phone: data.phone,
      email: data.email,
      printer_model: data.printerModel,
      quantity: data.quantity,
      rental_period: data.rentalPeriod,
      usage: Array.isArray(data.usage) ? data.usage.join(', ') : (data.usage || ''),
      print_types: data.printTypes,
      daily_print_quantity: data.dailyPrintQuantity,
      address: data.address,
      detailed_address: data.detailedAddress,
      status: 'pending' as const,
      quotation_data: { ...data, monthlyPrice, totalPrice: grandTotal },
    };

    try {
      const saved = await saveQuotation(quotationForSave);
      if (saved && saved.id) {
        setCurrentQuotationId(saved.id);
      }
    } catch (error) {
      console.error('Failed to save quotation:', error);
    }
  };

  const handleSignature = (sig: string) => {
    setSignature(sig);
    setIsSignDialogOpen(false);
    setStep('signed');
  };

  const handleReset = () => {
    setStep('form');
    setQuotationData(null);
    setSignature('');
    setCurrentQuotationId('');
    setTermsAgreed(false);
    resetCustomerInfoEmailFlag();
  };

  const handleSaveAsPDF = async () => {
    const element = document.getElementById('custom-quotation-pdf');
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
          // Remove app style tags but inject a font-safe style
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((tag) => {
            const content = tag.textContent || '';
            // Keep style tags that contain @font-face
            if (!content.includes('@font-face')) {
              tag.remove();
            }
          });

          const body = clonedDoc.body;
          if (body) { body.className = ''; body.style.cssText = 'background: #ffffff; margin: 0; padding: 0;'; }
          const html = clonedDoc.documentElement;
          if (html) { html.className = ''; html.style.cssText = 'background: #ffffff;'; }
          const clonedElement = clonedDoc.getElementById('custom-quotation-pdf');
          if (clonedElement) {
            clonedElement.style.cssText = 'background-color: #ffffff; width: 794px; padding: 0; margin: 0;';
            // Only remove Tailwind class names, preserve inline styles for Korean font rendering
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
      toast.success('PDF가 저장되었습니다.');
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      toast.error('PDF 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingPDF(false);
    }
  };

  const handleSendQuotation = async () => {
    if (!quotationData || !signature) return;

    setIsSending(true);
    try {
      // Save to localStorage
      const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
      const newQuotation = {
        id: currentQuotationId || `Q-${Date.now()}`,
        data: quotationData,
        signature,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };
      savedQuotations.push(newQuotation);
      localStorage.setItem('quotations', JSON.stringify(savedQuotations));

      // Update stored quotation status
      if (currentQuotationId) {
        try {
          await updateQuotation(currentQuotationId, {
            status: 'submitted',
            signature: signature,
            submitted_at: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to update quotation status:', error);
        }
      }

      // Send notifications
      try {
        await sendTelegramNotification(quotationData, signature);
      } catch (error) {
        console.error('Telegram notification failed:', error);
      }

      try {
        await sendSignatureEmail({
          ...quotationData,
          quotationId: newQuotation.id,
          totalPrice: quotationData.totalPrice || 0,
        });
      } catch (error) {
        console.error('Email notification failed:', error);
      }

      // Navigate to success page
      navigate('/success', {
        state: {
          quotationData,
          signature,
          quotationId: newQuotation.id,
        },
      });
    } catch (error) {
      console.error('Failed to send quotation:', error);
      toast.error('견적서 전송에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSending(false);
    }
  };

  const steps = [
    { key: 'form', label: '견적서 작성', icon: FileText },
    { key: 'preview', label: '미리보기', icon: PenTool },
    { key: 'signed', label: '서명 완료', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Step Progress - Premium */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={s.key} className="flex flex-col items-center relative z-10 flex-1">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-[transform,box-shadow] duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
                        : 'bg-[#f3f4f6]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>
                  <span className={`text-[10px] mt-1.5 font-semibold ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
            {/* Connector Lines */}
            <div className="absolute top-5 left-0 right-0 flex items-center px-12 -z-0">
              {[0, 1].map(i => (
                <div key={i} className="flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-gray-200">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: currentStepIndex > i ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <QuotationForm onSubmit={handleFormSubmit} />
            </motion.div>
          )}

          {step === 'preview' && quotationData && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <QuotationPreview data={quotationData} />

              {/* Terms Agreement */}
              {termsVisible && (
                <TermsAgreement
                  agreed={termsAgreed}
                  onAgreeChange={setTermsAgreed}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('form')}
                  className="px-5 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  수정
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignDialogOpen(true)}
                  disabled={termsVisible && !termsAgreed}
                  className="flex-[1.5] py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  전자 서명하기
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'signed' && quotationData && signature && (
            <motion.div
              key="signed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <SignedQuotation
                data={quotationData}
                signature={signature}
                onReset={handleReset}
                onSavePDF={handleSaveAsPDF}
                isSavingPDF={isSavingPDF}
              />

              {/* Send Button - Premium */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendQuotation}
                disabled={isSending}
                className="group relative w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden"
              >
                {/* Shimmer effect */}
                {!isSending && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                )}
                <span className="relative flex items-center gap-2">
                  {isSending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      견적서 전송하기
                      <Sparkles className="w-4 h-4 opacity-70" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signature Dialog */}
      {isSignDialogOpen && (
        <SignatureDialog
          onSign={handleSignature}
          onClose={() => setIsSignDialogOpen(false)}
        />
      )}

      {/* Hidden PDF quotation for saving */}
      {quotationData && signature && (
        <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
          <div id="custom-quotation-pdf" style={{ backgroundColor: '#ffffff', width: '794px' }}>
            <PDFQuotation data={quotationData} signature={signature} />
          </div>
        </div>
      )}
    </div>
  );
}