// 평판 프린터 커스텀 아이콘 컴포넌트
interface FlatbedPrinterIconProps {
  className?: string;
  showUV?: boolean;
}

export function FlatbedPrinterIcon({ className = "w-12 h-12", showUV = false }: FlatbedPrinterIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 프린터 베드 (가로로 넓은 테이블) */}
      <rect x="8" y="38" width="48" height="8" fill="currentColor" opacity="0.3" rx="1" />
      <rect x="8" y="42" width="48" height="4" fill="currentColor" opacity="0.5" />
      
      {/* 프린터 지지대 */}
      <rect x="10" y="18" width="3" height="20" fill="currentColor" opacity="0.6" />
      <rect x="51" y="18" width="3" height="20" fill="currentColor" opacity="0.6" />
      
      {/* 상단 가로 레일 */}
      <rect x="8" y="16" width="48" height="4" fill="currentColor" opacity="0.7" rx="1" />
      
      {/* 프린터 헤드 (움직이는 부분) */}
      <rect x="24" y="20" width="16" height="10" fill="currentColor" rx="2" />
      
      {/* 노즐/헤드 디테일 */}
      <rect x="26" y="28" width="2" height="4" fill="currentColor" opacity="0.8" />
      <rect x="30" y="28" width="2" height="4" fill="currentColor" opacity="0.8" />
      <rect x="34" y="28" width="2" height="4" fill="currentColor" opacity="0.8" />
      <rect x="38" y="28" width="2" height="4" fill="currentColor" opacity="0.8" />
      
      {showUV && (
        <>
          {/* UV 광선 효과 (보라색 포인트) */}
          <circle cx="28" cy="34" r="1.5" fill="#9333ea" opacity="0.8" />
          <circle cx="32" cy="35" r="1.5" fill="#a855f7" opacity="0.8" />
          <circle cx="36" cy="34" r="1.5" fill="#9333ea" opacity="0.8" />
          
          {/* CMYK 잉크 방울 */}
          <circle cx="20" cy="24" r="2" fill="#00FFFF" opacity="0.6" />
          <circle cx="24" cy="22" r="2" fill="#FF00FF" opacity="0.6" />
          <circle cx="40" cy="22" r="2" fill="#FFFF00" opacity="0.6" />
          <circle cx="44" cy="24" r="2" fill="#000000" opacity="0.4" />
        </>
      )}
    </svg>
  );
}
