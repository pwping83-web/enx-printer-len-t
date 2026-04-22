import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, RotateCcw, Check, PenLine, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignatureDialogProps {
  onSign: (signatureData: string) => void;
  onClose: () => void;
}

/**
 * Signature Dialog Component - Premium v2
 * - Animated entrance with spring physics
 * - Gradient header with icon
 * - Enhanced canvas area with guide text
 * - Better button states and micro-interactions
 */
export function SignatureDialog({
  onSign,
  onClose,
}: SignatureDialogProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL();
      onSign(signatureData);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <PenLine className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black">전자 서명</h2>
                <p className="text-xs text-white/70 mt-0.5">계약 동의를 위해 서명해주세요</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Signature Canvas */}
          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50/50 to-white hover:border-indigo-300 transition-colors">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-56 cursor-crosshair',
                style: { touchAction: 'none' },
              }}
              backgroundColor="transparent"
              penColor="#111827"
              onBegin={handleBegin}
            />
            {/* Guide text */}
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <PenLine className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-300 font-medium">여기에 서명해주세요</p>
                </div>
              </div>
            )}
          </div>

          {/* Clear Button */}
          <AnimatePresence>
            {!isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex justify-center"
              >
                <button
                  onClick={handleClear}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 bg-gray-100 px-4 py-2 rounded-xl transition-colors hover:bg-gray-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  다시 쓰기
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors active:scale-95"
          >
            취소
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isEmpty}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 relative overflow-hidden group"
          >
            {!isEmpty && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            )}
            <Check className="w-5 h-5 relative" />
            <span className="relative">서명 완료</span>
            {!isEmpty && <Sparkles className="w-3.5 h-3.5 relative opacity-70" />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}