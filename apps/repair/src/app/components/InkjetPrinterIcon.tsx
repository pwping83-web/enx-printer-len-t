export function InkjetPrinterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 프린터 헤드 (상단 박스) */}
      <rect
        x="20"
        y="15"
        width="60"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* 헤드에서 나오는 연결선 */}
      <line
        x1="30"
        y1="35"
        x2="30"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="45"
        y1="35"
        x2="45"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="55"
        y1="35"
        x2="55"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="70"
        y1="35"
        x2="70"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* CMYK 잉크 방울 - 아래쪽 */}
      {/* Cyan (하늘색) */}
      <ellipse
        cx="30"
        cy="60"
        rx="5"
        ry="8"
        fill="#00D4FF"
        opacity="0.8"
      />
      
      {/* Magenta (자홍색) */}
      <ellipse
        cx="45"
        cy="65"
        rx="5"
        ry="8"
        fill="#FF00FF"
        opacity="0.8"
      />
      
      {/* Yellow (노란색) */}
      <ellipse
        cx="55"
        cy="65"
        rx="5"
        ry="8"
        fill="#FFD700"
        opacity="0.8"
      />
      
      {/* Black (검정) */}
      <ellipse
        cx="70"
        cy="60"
        rx="5"
        ry="8"
        fill="#1F2937"
        opacity="0.8"
      />
      
      {/* 하단의 잉크 퍼짐 효과 (작은 방울들) */}
      <circle cx="28" cy="72" r="2" fill="#00D4FF" opacity="0.5" />
      <circle cx="32" cy="72" r="2" fill="#00D4FF" opacity="0.5" />
      
      <circle cx="43" cy="77" r="2" fill="#FF00FF" opacity="0.5" />
      <circle cx="47" cy="77" r="2" fill="#FF00FF" opacity="0.5" />
      
      <circle cx="53" cy="77" r="2" fill="#FFD700" opacity="0.5" />
      <circle cx="57" cy="77" r="2" fill="#FFD700" opacity="0.5" />
      
      <circle cx="68" cy="72" r="2" fill="#1F2937" opacity="0.5" />
      <circle cx="72" cy="72" r="2" fill="#1F2937" opacity="0.5" />
    </svg>
  );
}
