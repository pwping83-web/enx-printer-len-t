import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, AlertTriangle, ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gray-200 rounded-full opacity-30 blur-xl" />
      <div className="absolute bottom-32 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl" />

      <div className="w-full max-w-sm relative z-10 text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-xl">
            <AlertTriangle className="w-12 h-12 text-gray-500" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-black text-gray-300 mb-3">404</h1>
          <p className="text-lg font-bold text-gray-700 mb-2">
            페이지를 찾을 수 없습니다
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            요청하신 페이지가 존재하지 않거나
            <br />
            이동되었을 수 있습니다.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-200/50 hover:shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지로
          </button>
        </motion.div>
      </div>
    </div>
  );
}
