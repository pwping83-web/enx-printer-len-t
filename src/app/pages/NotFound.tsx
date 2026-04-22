import { Link } from 'react-router';
import { Home, ArrowLeft, Printer, Search } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * 404 Not Found Page - Premium v2
 * - Animated illustration with floating elements
 * - Gradient text effects
 * - Smooth entrance animations
 * - Modern action buttons
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 pb-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm w-full text-center relative z-10"
      >
        {/* Illustration */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/10 rotate-6"
          >
            <Search className="w-14 h-14 text-indigo-300" />
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg -rotate-12"
          >
            <Printer className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1
            className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 mb-3"
            style={{ fontSize: '5rem', lineHeight: 1 }}
          >
            404
          </h1>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            요청하신 페이지가 존재하지 않거나
            <br />
            이동되었을 수 있습니다.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Link
            to="/"
            className="group flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-95 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <Home className="w-5 h-5 relative" />
            <span className="relative">홈으로 가기</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            이전 페이지
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-xs text-gray-300"
        >
          문제가 계속되면 관리자에게 문의해주세요
        </motion.p>
      </motion.div>
    </div>
  );
}
