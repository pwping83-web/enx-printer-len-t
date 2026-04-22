/**
 * Success Page Component - Upgraded
 * 
 * Beautiful success confirmation page with:
 * - Animated checkmark with ring effect
 * - Floating particle decorations
 * - Expected timeline info
 * - Contact info for follow-up
 */

import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  CheckCircle,
  Home,
  Phone,
  Clock,
  MessageSquare,
  Printer,
  ArrowRight,
} from "lucide-react";

const PHONE_NUMBER = "010-4639-2673";

export function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    requestId?: string;
    customerName?: string;
    customerPhone?: string;
  } | null;

  const timeline = [
    { icon: CheckCircle, label: "접수 완료", desc: "견적 요청이 접수되었습니다", active: true },
    { icon: Phone, label: "담당자 확인", desc: "담당자가 내용을 검토합니다", active: false },
    { icon: MessageSquare, label: "견적 안내", desc: "문자 또는 전화로 안내드립니다", active: false },
    { icon: Printer, label: "방문 수리", desc: "약속된 일시에 방문합니다", active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-green-200 rounded-full opacity-20 blur-xl" />
      <div className="absolute top-40 right-8 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl" />
      <div className="absolute bottom-32 left-16 w-20 h-20 bg-emerald-200 rounded-full opacity-20 blur-xl" />

      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [-20, -80],
            opacity: [0, 1, 0],
            x: [0, (i % 2 === 0 ? 20 : -20)],
          }}
          transition={{
            duration: 2,
            delay: 0.3 + i * 0.2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="absolute"
          style={{
            left: `${15 + i * 13}%`,
            bottom: "40%",
          }}
        >
          <span className="text-lg">{["🎉", "✨", "🎊", "⭐", "💫", "🌟"][i]}</span>
        </motion.div>
      ))}

      <div className="w-full max-w-sm relative z-10">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            {/* Outer ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
              className="absolute inset-0 bg-green-400 rounded-full"
            />
            {/* Inner circle */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-200/50 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              >
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            접수 완료!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            수리 요청이 성공적으로 접수되었습니다
          </p>
        </motion.div>

        {/* Request Info Card */}
        {state?.customerName && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">고객명</span>
                <span className="text-sm font-bold text-gray-900">{state.customerName} 님</span>
              </div>
              {state.requestId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">접수번호</span>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    #{state.requestId.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            진행 단계
          </h3>
          <div className="space-y-4">
            {timeline.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.active
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${step.active ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-bold ${step.active ? "text-green-700" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100"
        >
          <p className="text-xs text-blue-800 leading-relaxed text-center">
            <span className="font-bold">📞 담당자가 빠른 시간 내에 연락드리겠습니다</span>
            <br />
            <span className="text-blue-600">영업시간: 평일 09:00 ~ 18:00</span>
          </p>
        </motion.div>

        {/* Direct Call Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mb-6"
        >
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="w-full py-3.5 bg-white border-2 border-green-200 text-green-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:bg-green-50"
          >
            <Phone className="w-4 h-4" />
            급한 문의: {PHONE_NUMBER}
          </a>
        </motion.div>

        {/* Home Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-200/50 hover:shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
    </div>
  );
}