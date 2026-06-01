import React from "react";

interface MJKLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function MJKLogo({ className = "", size = 48, showText = false }: MJKLogoProps) {
  return (
    <div id="mjk_brand_container" className={`flex items-center gap-3 ${className}`} style={{ direction: "ltr" }}>
      <div className="relative group flex items-center justify-center">
        {/* Glowing atmospheric halo in background on hover */}
        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
        
        <svg
          id="mjk_svg_node"
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
        >
          <defs>
            {/* Elegant metallic chrome/silver gradient */}
            <linearGradient id="silverChrome" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#F1F5F9" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="85%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Glowing neon cyber-cyan gradient */}
            <linearGradient id="cyberCyan" x1="20" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0891B2" />
              <stop offset="40%" stopColor="#06B6D4" />
              <stop offset="75%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Neon Cyan Glow Filter */}
            <filter id="neonRefraction" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Deep drop-shadow filter */}
            <filter id="luxuriousShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Inner ambient light ring */}
          <circle cx="100" cy="100" r="92" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="80" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.04" />

          <g filter="url(#luxuriousShadow)">
            {/* The Stylized 'M' Wings */}
            {/* Left Portion of 'M' */}
            <path
              d="M32 145 L32 65 L60 38 L85 82 L72 105 L52 90 L52 145 Z"
              fill="url(#silverChrome)"
            />

            {/* Right Portion of 'M' */}
            <path
              d="M168 145 L168 65 L140 38 L115 82 L128 105 L148 90 L148 145 Z"
              fill="url(#silverChrome)"
            />

            {/* Stylized Curve underneath resembling the 'U' or 'J' loop in MJK logo */}
            <path
              d="M75 102 C75 138, 125 138, 125 102 L138 102 C138 155, 62 155, 62 102 Z"
              fill="url(#silverChrome)"
            />

            {/* Left Top Spike Accent */}
            <path d="M32 65 L43 45 L60 38 Z" fill="#FFFFFF" opacity="0.9" />
            {/* Right Top Spike Accent */}
            <path d="M168 65 L157 45 L140 38 Z" fill="#FFFFFF" opacity="0.9" />

            {/* Glowing Neon Cyber Slash Cutting through the M diagonally */}
            <line
              x1="22"
              y1="172"
              x2="178"
              y2="28"
              stroke="url(#cyberCyan)"
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#neonRefraction)"
            />

            {/* Super Fine High-intensity core to the neon line for maximum lux glow */}
            <line
              x1="24"
              y1="170"
              x2="176"
              y2="30"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Glowing energy stars at terminal endpoints */}
            <circle cx="178" cy="28" r="3" fill="#FFFFFF" filter="url(#neonRefraction)" />
            <circle cx="22" cy="172" r="3" fill="#FFFFFF" filter="url(#neonRefraction)" />
          </g>
        </svg>
      </div>

      {showText && (
        <div id="mjk_branding_text" className="flex flex-col text-left select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[18px] font-black tracking-[0.25em] text-white font-mono leading-none">
              MJK
            </span>
            <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          <span className="text-[8.5px] font-semibold tracking-[0.45em] text-cyan-400 font-mono uppercase mt-1.5 opacity-90">
            SYSTEM
          </span>
        </div>
      )}
    </div>
  );
}
