import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Printer,
  ChevronRight,
  Camera,
  MapPin,
  CalendarCheck,
  Phone,
  ArrowRight,
  Wrench,
} from "lucide-react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* ─── Header (minimal) ─── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">
              ENX Printer
            </span>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            관리자
          </button>
        </div>
      </header>

      {/* ─── Hero: 로고 + 텍스트 + 버튼 (뷰포트 중앙 배치) ─── */}
      <main className="flex-1 flex flex-col w-full">
        <motion.section
          {...fade(0)}
          className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-[70svh]"
        >
          {/* Wrench Icon */}
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100/50">
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full mb-6 border border-blue-100/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            전국 출장 수리 전문
          </div>

          {/* Title */}
          <h1 className="text-[28px] font-black text-gray-900 leading-[1.35] tracking-tight mb-4 break-keep text-center">
            찍고, 보내고, <span className="text-blue-600">바로 견적.</span>
          </h1>

          {/* Description */}
          <p className="text-[15px] text-gray-500 leading-[1.7] font-medium break-keep text-center mb-10">
            사진 한 장이면 접수 완료,<br />
            <span className="text-blue-600 font-bold">출장비는 자동 계산</span>됩니다.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate("/customer/request")}
            className="w-full max-w-[280px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl py-4 px-6 flex items-center justify-center transition-all active:scale-[0.97] shadow-[0_8px_24px_-6px_rgba(37,99,235,0.45)]"
          >
            <span className="text-[17px] font-bold">견적 요청하기</span>
          </button>
        </motion.section>

        {/* ─── How it works ─── */}
        <motion.section {...fade(0.2)} className="px-5 pb-6 w-full">
          <h2 className="text-[14px] font-bold text-gray-900 mb-4 px-1">이용 방법</h2>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-4 bg-gray-50/80 rounded-2xl p-4 border border-gray-100/80">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Camera className="w-4.5 h-4.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-bold text-gray-900 mb-0.5 break-keep">고장 부위 촬영</h3>
                <p className="text-[12px] text-gray-500 font-medium break-keep">명판과 고장 증상 촬영</p>
              </div>
            </div>

            {/* Highlighted Step for Auto Calculation */}
            <div className="flex items-center gap-4 bg-blue-50/80 rounded-2xl p-4 border border-blue-200/60 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0 relative z-10">
                <MapPin className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 flex-1 relative z-10">
                <h3 className="text-[15px] font-black text-blue-900 mb-0.5 break-keep">출장비 자동 계산</h3>
                <p className="text-[13px] text-blue-700 font-bold break-keep">주소지 기반 비용 산출</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50/80 rounded-2xl p-4 border border-gray-100/80">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <CalendarCheck className="w-4.5 h-4.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-bold text-gray-900 mb-0.5 break-keep">일정 선택 및 접수</h3>
                <p className="text-[12px] text-gray-500 font-medium break-keep">원하는 방문 날짜 선택</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Contact ─── */}
        <motion.section {...fade(0.3)} className="px-5 pb-10 w-full">
          <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/80">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4">출장 문의</h2>
            <div className="space-y-4">
              <a href="tel:010-4639-2673" className="flex items-center justify-between group active:opacity-70 transition-opacity w-full">
                <div className="flex items-center gap-3 text-gray-700 min-w-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-[15px] font-black tracking-tight truncate">전화 상담 연결</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 ml-3" />
              </a>
            </div>
          </div>
        </motion.section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="px-5 py-6 text-center border-t border-gray-100 w-full mt-auto">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed break-keep">
          ENX Printer · 사업자등록번호 302-47-00920
          <br />
          &copy; {new Date().getFullYear()} ENX Printer. All rights reserved.
        </p>
      </footer>
    </div>
  );
}