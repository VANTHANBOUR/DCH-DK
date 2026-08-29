import React from 'react';

interface BrandLogoProps {
  variant?: 'full-letterhead' | 'header' | 'compact' | 'shield-only' | 'monochrome';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const DCHShield: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.18)}
      viewBox="0 0 100 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm ${className}`}
    >
      {/* Outer Shield Outline */}
      <path
        d="M50 3L92 14V56C92 88 50 115 50 115C50 115 8 88 8 56V14L50 3Z"
        fill="#007A43"
        stroke="#E68A00"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Shield Background & Clip */}
      <mask id="shield-inner-mask">
        <path
          d="M50 7L88 17V54C88 84 50 110 50 110C50 110 12 84 12 54V17L50 7Z"
          fill="#FFFFFF"
        />
      </mask>

      <g mask="url(#shield-inner-mask)">
        {/* Left Side: Deep Forest Green */}
        <rect x="0" y="0" width="50" height="120" fill="#006A38" />

        {/* Right Side: Clean White */}
        <rect x="50" y="0" width="50" height="120" fill="#FFFFFF" />

        {/* Vertical divider line */}
        <line x1="50" y1="5" x2="50" y2="115" stroke="#E68A00" strokeWidth="2" />

        {/* Left Half: D C H text stacked vertically */}
        <text
          x="30"
          y="42"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="24"
          textAnchor="middle"
          letterSpacing="1"
        >
          D
        </text>
        <text
          x="30"
          y="68"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="24"
          textAnchor="middle"
          letterSpacing="1"
        >
          C
        </text>
        <text
          x="30"
          y="94"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="24"
          textAnchor="middle"
          letterSpacing="1"
        >
          H
        </text>

        {/* Right Half: Graduation Cap & Open Book */}
        {/* Mortarboard Cap */}
        <g transform="translate(54, 25) scale(0.72)">
          {/* Cap diamond */}
          <polygon points="25,5 45,15 25,25 5,15" fill="#007A43" stroke="#004D25" strokeWidth="1" />
          {/* Cap skull cap under */}
          <path d="M14 19.5V26C14 30 36 30 36 26V19.5" fill="#007A43" stroke="#004D25" strokeWidth="1" />
          {/* Cap Tassel */}
          <path d="M25 15C32 17 38 23 39 31" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="25" cy="15" r="2.5" fill="#F59E0B" />
          <circle cx="39" cy="32" r="2" fill="#E68A00" />
        </g>

        {/* Open Book with pages */}
        <g transform="translate(54, 56) scale(0.72)">
          {/* Book Base / Spines */}
          <path
            d="M5 28C14 22 24 23 26 27C28 23 38 22 47 28V12C38 6 28 7 26 11C24 7 14 6 5 12V28Z"
            fill="#007A43"
          />
          {/* Book inner golden pages */}
          <path
            d="M6 24C14 19 23 20 25 24C27 20 36 19 44 24V11C36 6 27 7 25 11C23 7 14 6 6 11V24Z"
            fill="#FFFBEB"
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
          {/* Center Spine marker */}
          <line x1="25" y1="10" x2="25" y2="25" stroke="#E68A00" strokeWidth="2" />
          {/* Curved energetic swoop lines */}
          <path d="M8 35C18 31 32 32 42 38" stroke="#007A43" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M12 40C20 37 30 38 38 43" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  if (variant === 'shield-only') {
    const shieldSize = size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 60 : 76;
    return <DCHShield size={shieldSize} className={className} />;
  }

  if (variant === 'full-letterhead') {
    return (
      <div className={`flex flex-col items-center text-center p-4 bg-white select-none ${className}`}>
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl">
          <DCHShield size={72} className="shrink-0" />
          <div className="flex flex-col text-left justify-center">
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#007A43] font-['Battambang',sans-serif] tracking-wide leading-tight">
              ឌូវី ឆាល់ឃែរ៍ ហោស៍
            </h1>
            <h2 className="text-lg sm:text-2xl font-black text-[#007A43] font-['Outfit',sans-serif] tracking-wider uppercase leading-none mt-1">
              DEWEY CHILDCARE HOUSE
            </h2>
          </div>
        </div>

        {/* Divider bar */}
        <div className="w-full max-w-2xl h-[3px] bg-[#007A43] my-2.5 rounded-full" />

        {/* Subtitles */}
        <div className="w-full max-w-2xl text-center space-y-0.5">
          <p className="text-sm sm:text-base font-bold text-[#007A43] font-['Kantumruy_Pro',sans-serif]">
            មត្តេយ្យសិក្សាអន្តរជាតិ ៣ ភាសា ( អង់គ្លេស-ខ្មែរ-ចិន )
          </p>
          <p className="text-xs sm:text-sm font-bold text-[#007A43] tracking-wide uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            International Trilingual Kindergarten
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <DCHShield size={36} />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-[#007A43] font-['Battambang',sans-serif]">ឌូវី ឆាល់ឃែរ៍ ហោស៍</span>
          <span className="text-sm font-black text-[#006838] tracking-tight uppercase">Dewey Childcare</span>
          <span className="text-[10px] text-amber-700 font-semibold tracking-wide">Trilingual Kindergarten</span>
        </div>
      </div>
    );
  }

  // Default 'header' variant
  const shieldSize = size === 'sm' ? 36 : size === 'md' ? 46 : 58;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 select-none ${className}`}>
      <DCHShield size={shieldSize} />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-[#007A43] font-['Battambang',sans-serif] tracking-normal">
            ឌូវី ឆាល់ឃែរ៍ ហោស៍
          </span>
          <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            DCH Portal
          </span>
        </div>
        <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#006838] tracking-tight uppercase font-['Outfit',sans-serif] leading-none mt-0.5">
          Dewey Childcare House
        </span>
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs font-medium text-emerald-800 tracking-wide mt-0.5">
            International Trilingual Kindergarten (EN · KM · ZH)
          </span>
        )}
      </div>
    </div>
  );
};
