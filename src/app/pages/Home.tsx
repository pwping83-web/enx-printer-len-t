import { Link, useNavigate } from 'react-router';
import { Printer, Settings, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

import galleryImg1 from "figma:asset/8bb9bdf8f5ff1ff5cfaec95011b64ed9d243a6a7.png";
import galleryImg2 from "figma:asset/86969de2d94472132bceabd573e6938d8b0b329c.png";
import galleryImg3 from "figma:asset/71944178c5742b060d2f0408ce1f6abad6b5f0a3.png";
import galleryImg4 from "figma:asset/0f198d915048462065dae0ca4cedb86390760551.png";
import galleryImg5 from "figma:asset/f4d02d4a7391c18fb62670c76520a7b21639e0e0.png";

import heroBg from "figma:asset/e91ead704c9b9f045428d1f16ff567977d4ab6f5.png";
import printerImg from "figma:asset/27186e5e3bd52e79f702cf5d116fac7ed69bb270.png";

export default function Home() {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminAccess = () => {
    if (password === 'kkus2011!!') {
      navigate('/admin');
      setShowPasswordModal(false);
      setPassword('');
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다.');
      setPassword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdminAccess();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">MacaPrint</span>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
            aria-label="관리자 설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section - Full viewport with background image */}
        <section className="relative" style={{ minHeight: 'calc(100dvh - 57px)' }}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroBg}
              alt="마카롱 프린팅"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
          </div>

          {/* Content overlay - centered vertically */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: 'calc(100dvh - 57px)' }}>
            {/* Title */}
            <h1 className="text-[2rem] font-black text-white leading-tight mb-3 tracking-tight">
              식용 프린터 렌탈로<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                특별함을 더하다
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-base mb-6 font-semibold">
              마카롱·쿠키에 나만의 디자인을 인쇄하세요
            </p>

            {/* Printer showcase badge */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8">
              <img
                src={printerImg}
                alt="마카롱 프린터"
                className="w-14 h-14 object-contain opacity-90 rounded-lg"
              />
              <div className="text-left">
                <p className="text-white/90 text-xs font-bold">A4 · A3 · A2 식용 프린터</p>
                <p className="text-white/60 text-[11px] font-medium">설치부터 유지보수까지 올인원 렌탈</p>
              </div>
            </div>

            {/* 판매 특가 배지 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/30">
                <span className="text-white/80 text-xs font-medium">Epson 3156 A4 판매 특가</span>
                <span className="text-white font-bold text-xs">2,000,000원</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to="/custom"
              className="group flex items-center justify-center gap-2 w-full max-w-xs py-4 bg-white text-indigo-700 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all"
            >
              무료 견적 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="px-6 py-10 bg-gray-50">
          <div className="flex items-center justify-center mb-5 text-center">
            <h2 className="text-lg font-bold text-gray-900">다양한 활용 사례</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Row 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square overflow-hidden">
                <img src={galleryImg1} alt="브랜드 로고 마카롱" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-3 py-2.5 text-center">
                <h3 className="font-bold text-gray-900 text-xs">브랜드·로고</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square overflow-hidden">
                <img src={galleryImg2} alt="프리미엄 기프트 마카롱" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-3 py-2.5 text-center">
                <h3 className="font-bold text-gray-900 text-xs">프리미엄·기프트</h3>
              </div>
            </div>

            {/* Row 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square overflow-hidden">
                <img src={galleryImg3} alt="기업 행사 마카롱" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-3 py-2.5 text-center">
                <h3 className="font-bold text-gray-900 text-xs">기업·행사</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square overflow-hidden">
                <img src={galleryImg4} alt="기념 선물 마카롱" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-3 py-2.5 text-center">
                <h3 className="font-bold text-gray-900 text-xs">기념일·선물</h3>
              </div>
            </div>

            {/* Row 3 - Full width */}
            <div className="col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-[2/1] overflow-hidden">
                <img src={galleryImg5} alt="웨딩 파티 마카롱" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-3 py-2.5 text-center">
                <h3 className="font-bold text-gray-900 text-xs">웨딩·파티</h3>
              </div>
            </div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-6 text-center border-t border-gray-200 bg-gray-50">
        <p className="text-[11px] text-gray-400 font-medium mb-1.5">
          ENX Printer · 사업자등록번호 302-47-00920
        </p>
        <p className="text-[10px] text-gray-400">
          © {new Date().getFullYear()} MacaPrint. All rights reserved.
        </p>
      </footer>

      {/* Admin Password Modal - Simplified, no animations */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
              <h2 className="text-lg font-bold text-white">관리자 인증</h2>
              <p className="text-indigo-100 text-xs mt-1">설정 이지에 접근하려면 비밀번호가 필요합니다</p>
            </div>
            <div className="p-5">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-900 placeholder:text-gray-400 font-medium mb-3"
                placeholder="비밀번호 입력"
                autoFocus
              />
              {error && <p className="text-xs text-red-500 font-medium mb-3">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPasswordModal(false); setPassword(''); setError(''); }}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleAdminAccess}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors text-sm"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}