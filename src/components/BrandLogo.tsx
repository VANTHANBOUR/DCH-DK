import React from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_SCHOOL_PROFILE } from '../data/mockData';

export interface BrandLogoProps {
  variant?: 'full-letterhead' | 'header' | 'compact' | 'shield-only' | 'monochrome';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  customLogoUrl?: string | null;
  forceDefaultShield?: boolean;
  schoolNameKhmer?: string;
  schoolNameEnglish?: string;
  taglineKhmer?: string;
  taglineEnglish?: string;
  portalBadgeText?: string;
}

const useAppSafe = () => {
  try {
    return useApp();
  } catch {
    return {
      schoolProfile: INITIAL_SCHOOL_PROFILE,
    } as any;
  }
};

export const DIShield: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.14)}
      viewBox="0 0 1000 1140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm select-none ${className}`}
      aria-label="Dewey International (DI) Official Logo"
    >
      <defs>
        {/* Inner Shield Clip Path */}
        <clipPath id="diShieldInnerClip">
          <path d="M 500,86 C 685,86 896,132 896,132 C 896,445 870,720 500,1050 C 130,720 104,445 104,132 C 104,132 315,86 500,86 Z" />
        </clipPath>
        {/* Right Half Clip */}
        <clipPath id="diRightClip">
          <rect x="500" y="0" width="500" height="1140" />
        </clipPath>
      </defs>

      {/* 1. Outer Shield (Emerald Green Base) */}
      <path
        d="M 500,60 C 705,60 940,110 940,110 C 940,460 912,750 500,1080 C 88,750 60,460 60,110 C 60,110 295,60 500,60 Z"
        fill="#008242"
      />

      {/* 2. Gold Accent Border Line */}
      <path
        d="M 500,86 C 685,86 896,132 896,132 C 896,445 870,720 500,1050 C 130,720 104,445 104,132 C 104,132 315,86 500,86 Z"
        fill="none"
        stroke="#F58220"
        strokeWidth="18"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 3. Inner Shield Content Area */}
      <g clipPath="url(#diShieldInnerClip)">
        {/* Left Side: Solid Emerald Green */}
        <rect x="0" y="0" width="500" height="1140" fill="#008242" />

        {/* Right Side: Clean White Canvas */}
        <rect x="500" y="0" width="500" height="1140" fill="#FFFFFF" />

        {/* Vertical Split Line */}
        <line x1="500" y1="86" x2="500" y2="1050" stroke="#008242" strokeWidth="2" />

        {/* LEFT HALF: D I Monogram */}
        <g fill="#FFFFFF" fontFamily="'Times New Roman', 'Baskerville', 'Georgia', serif" fontWeight="bold" textAnchor="middle">
          <text x="290" y="440" fontSize="280" letterSpacing="4">D</text>
          <text x="290" y="740" fontSize="280" letterSpacing="4">I</text>
        </g>

        {/* RIGHT HALF: Academic Cap & Open Book */}
        <g clipPath="url(#diRightClip)">
          {/* Graduation Cap */}
          <polygon points="700,268 852,308 700,348 548,308" fill="#008242" />
          <path d="M 588,335 C 588,335 588,390 700,412 C 812,390 812,335 812,335 C 812,335 776,374 700,374 C 624,374 588,335 588,335 Z" fill="#008242" />
          <path d="M 558,308 L 558,405" stroke="#008242" strokeWidth="6" strokeLinecap="round" />
          <circle cx="558" cy="412" r="7.5" fill="#008242" />
          <ellipse cx="700" cy="308" rx="7" ry="5" fill="#FFFFFF" />
          <ellipse cx="700" cy="308" rx="4" ry="3" fill="#008242" />

          {/* Open Book Wings */}
          <path d="M 698,532 C 672,475 588,446 515,482 C 555,496 630,504 682,530 Z" fill="#F58220" />
          <path d="M 554,435 C 598,435 660,462 696,520 C 660,488 596,468 540,460 Z" fill="#F58220" />
          <path d="M 702,532 C 728,475 812,446 885,482 C 845,496 770,504 718,530 Z" fill="#F58220" />
          <path d="M 846,435 C 802,435 740,462 704,520 C 740,488 804,468 860,460 Z" fill="#F58220" />

          {/* Open Book Curved Pages */}
          <path d="M 500,580 C 650,555 810,578 905,618 L 905,638 C 810,598 650,575 500,600 Z" fill="#008242" />
          <path d="M 500,685 C 620,630 755,640 885,700 C 850,718 730,662 500,715 Z" fill="#008242" />
          <path d="M 500,740 C 610,695 725,705 845,775 C 805,792 700,730 500,772 Z" fill="#008242" />
          <path d="M 500,798 C 590,758 680,770 785,848 C 730,868 645,808 500,832 Z" fill="#008242" />
        </g>
      </g>
    </svg>
  );
};

export const DCHShield = DIShield;

export const SchoolLogoIcon: React.FC<{
  size?: number;
  className?: string;
  customLogoUrl?: string | null;
  forceDefaultShield?: boolean;
}> = ({ size = 48, className = '', customLogoUrl, forceDefaultShield = false }) => {
  const { schoolProfile } = useAppSafe();
  const effectiveLogoUrl = forceDefaultShield 
    ? null 
    : (customLogoUrl !== undefined ? customLogoUrl : schoolProfile?.customLogoUrl);

  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [effectiveLogoUrl]);

  if (effectiveLogoUrl && !hasError) {
    return (
      <div 
        style={{ width: size, height: Math.round(size * 1.14) }} 
        className={`shrink-0 flex items-center justify-center relative overflow-hidden rounded-xl bg-white shadow-xs border border-emerald-100 p-1 ${className}`}
      >
        <img
          src={effectiveLogoUrl}
          alt={schoolProfile?.schoolNameEnglish || "School Logo"}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={() => {
            setHasError(true);
          }}
        />
      </div>
    );
  }

  return <DCHShield size={size} className={className} />;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  size = 'md',
  showSubtitle = true,
  customLogoUrl,
  forceDefaultShield = false,
  schoolNameKhmer,
  schoolNameEnglish,
  taglineKhmer,
  taglineEnglish,
  portalBadgeText,
}) => {
  const { schoolProfile } = useAppSafe();

  const khmerTitle = schoolNameKhmer || schoolProfile?.schoolNameKhmer || INITIAL_SCHOOL_PROFILE.schoolNameKhmer;
  const engTitle = schoolNameEnglish || schoolProfile?.schoolNameEnglish || INITIAL_SCHOOL_PROFILE.schoolNameEnglish;
  const khmerSub = taglineKhmer || schoolProfile?.taglineKhmer || INITIAL_SCHOOL_PROFILE.taglineKhmer;
  const engSub = taglineEnglish || schoolProfile?.taglineEnglish || INITIAL_SCHOOL_PROFILE.taglineEnglish;
  const badgeLabel = portalBadgeText || schoolProfile?.portalBadgeText || INITIAL_SCHOOL_PROFILE.portalBadgeText;

  if (variant === 'shield-only') {
    const shieldSize = size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 60 : size === 'xl' ? 76 : 96;
    return (
      <SchoolLogoIcon 
        size={shieldSize} 
        className={className} 
        customLogoUrl={customLogoUrl} 
        forceDefaultShield={forceDefaultShield} 
      />
    );
  }

  if (variant === 'full-letterhead') {
    return (
      <div className={`flex flex-col items-center text-center p-4 bg-white select-none ${className}`}>
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-3xl">
          <SchoolLogoIcon 
            size={80} 
            className="shrink-0" 
            customLogoUrl={customLogoUrl} 
            forceDefaultShield={forceDefaultShield} 
          />
          <div className="flex flex-col text-left justify-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#008242] font-['Battambang',sans-serif] tracking-wide leading-tight">
              {khmerTitle}
            </h1>
            <h2 className="text-xl sm:text-2xl font-black text-[#008242] font-['Outfit',sans-serif] tracking-wider uppercase leading-none mt-1">
              {engTitle}
            </h2>
          </div>
        </div>

        {/* Divider bar */}
        <div className="w-full max-w-3xl h-[3.5px] bg-[#008242] my-3 rounded-full" />

        {/* Subtitles */}
        <div className="w-full max-w-3xl text-center space-y-1">
          <p className="text-sm sm:text-base font-bold text-[#008242] font-['Kantumruy_Pro',sans-serif]">
            {khmerSub}
          </p>
          <p className="text-xs sm:text-sm font-bold text-[#008242] tracking-wide uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            {engSub}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <SchoolLogoIcon 
          size={36} 
          customLogoUrl={customLogoUrl} 
          forceDefaultShield={forceDefaultShield} 
        />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-[#008242] font-['Battambang',sans-serif]">{khmerTitle}</span>
          <span className="text-sm font-black text-[#008242] tracking-tight uppercase font-['Outfit',sans-serif]">{engTitle}</span>
          <span className="text-[10px] text-amber-700 font-semibold tracking-wide">{engSub}</span>
        </div>
      </div>
    );
  }

  // Default 'header' variant
  const shieldSize = size === 'sm' ? 36 : size === 'md' ? 46 : size === 'lg' ? 58 : 72;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 select-none ${className}`}>
      <SchoolLogoIcon 
        size={shieldSize} 
        customLogoUrl={customLogoUrl} 
        forceDefaultShield={forceDefaultShield} 
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-[#008242] font-['Battambang',sans-serif] tracking-normal">
            {khmerTitle}
          </span>
          <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#008242] border border-emerald-200">
            {badgeLabel}
          </span>
        </div>
        <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#008242] tracking-tight uppercase font-['Outfit',sans-serif] leading-none mt-0.5">
          {engTitle}
        </span>
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs font-medium text-emerald-800 tracking-wide mt-0.5">
            {engSub}
          </span>
        )}
      </div>
    </div>
  );
};

