interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 100, height = 100, className = "" }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="none"
      width={width}
      height={height}
      className={className}
    >
      <rect x="20" y="35" width="60" height="40" rx="4" fill="#3B82F6"/>
      <rect x="25" y="40" width="50" height="15" rx="2" fill="#60A5FA"/>
      <rect x="30" y="20" width="40" height="20" rx="2" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2"/>
      <text x="50" y="55" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">ENX</text>
      <rect x="25" y="70" width="50" height="8" rx="2" fill="#1E40AF"/>
      <rect x="35" y="75" width="30" height="15" rx="1" fill="#F3F4F6" stroke="#3B82F6" strokeWidth="1"/>
      <line x1="40" y1="80" x2="60" y2="80" stroke="#3B82F6" strokeWidth="1.5"/>
      <line x1="40" y1="85" x2="55" y2="85" stroke="#60A5FA" strokeWidth="1.5"/>
    </svg>
  );
}
