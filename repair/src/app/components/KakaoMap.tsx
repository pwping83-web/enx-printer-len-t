import React from 'react';

// 카카오 객체에 대한 모든 참조를 제거한 순수 UI 컴포넌트입니다.
export function KakaoMap() {
  return (
    <div 
      className="w-full h-[250px] bg-slate-50 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-dashed border-slate-200"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 배경 그리드 디자인 (지도 느낌) */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center p-6 text-center">
        {/* 위치 아이콘 배경 */}
        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <span className="text-3xl" role="img" aria-label="location">📍</span>
        </div>

        <h3 className="text-base font-bold text-slate-700 mb-1">
          지도 서비스를 불러올 수 없습니다
        </h3>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          피그마 보안 정책으로 인해 지도가 차단되었습니다.<br/>
          <strong>하지만 걱정 마세요! 거리 계산과 주소 검색은<br/> 정상적으로 작동하여 견적에 반영됩니다.</strong>
        </p>

        {/* 하단 상태 바 */}
        <div className="mt-5 flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Safe Bypass Mode Active
          </span>
        </div>
      </div>
      
      {/* 장식용 하단 그라데이션 */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-30"></div>
    </div>
  );
}