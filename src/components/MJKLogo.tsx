interface MJKLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function MJKLogo({ className = "", size = 48, showText = false }: MJKLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="16" y="16" width="168" height="168" rx="40" fill="#0F172A" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="24" y="24" width="152" height="152" rx="32" fill="#5865F2" fillOpacity="0.08" />
          <path
            d="M55 140V60L80 85L100 60L120 85L145 60V140"
            stroke="#5865F2"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M55 140V60L80 85L100 60L120 85L145 60V140"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <span className="text-lg font-bold tracking-wider text-white leading-none">
            MJK
          </span>
          <span className="text-[9px] font-medium tracking-[0.25em] text-text-dim leading-none mt-1">
            SYSTEM
          </span>
        </div>
      )}
    </div>
  );
}
