import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'wordmark' | 'isotype' | 'official';
  className?: string;
  showOfficialBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showOfficialBadge = false,
}) => {
  // Sizing definitions matching TravelRockChannel and SuperTourChannel
  const dimensions = {
    xs: {
      text: 'text-sm',
      badge: 'w-7 h-7 text-xs',
      mask: 'w-6 h-6',
      gap: 'gap-1.5',
    },
    sm: {
      text: 'text-base sm:text-lg',
      badge: 'w-9 h-9 text-sm',
      mask: 'w-8 h-8',
      gap: 'gap-2',
    },
    md: {
      text: 'text-lg sm:text-xl md:text-[22px]',
      badge: 'w-10 h-10 text-base',
      mask: 'w-9 h-9',
      gap: 'gap-2.5',
    },
    lg: {
      text: 'text-2xl sm:text-3xl',
      badge: 'w-14 h-14 text-xl',
      mask: 'w-12 h-12',
      gap: 'gap-3',
    },
    xl: {
      text: 'text-3xl sm:text-4xl md:text-5xl',
      badge: 'w-20 h-20 text-3xl',
      mask: 'w-16 h-16',
      gap: 'gap-4',
    },
  };

  const current = dimensions[size];

  // The "SB" Isotype Badge matching TravelRockChannel (TR) squircle format
  const IsotypeBadge = (
    <div
      className={`relative flex items-center justify-center font-black select-none shrink-0 rounded-[22%] bg-[#0C0C0C] border-2 border-[#159447] shadow-[0_0_15px_rgba(21,148,71,0.25)] ${current.badge}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
      aria-label="Samba Brasil Channel Isotipo"
    >
      <span className="flex items-center tracking-tighter leading-none">
        <span className="text-white">S</span>
        <span className="text-[#159447]">B</span>
      </span>
    </div>
  );

  // The Wordmark in a single line: SAMBA (white), BRASIL (#159447), CHANNEL (white)
  const WordmarkText = (
    <span
      className={`font-outfit font-black uppercase tracking-tight select-none whitespace-nowrap leading-none ${current.text}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <span className="text-white">SAMBA</span>
      <span className="text-[#159447]">BRASIL</span>
      <span className="text-white">CHANNEL</span>
    </span>
  );

  // Official Carnival Mask Emblem SVG (stylized with green, yellow, blue feathers)
  const CarnivalMask = (
    <svg
      className={`shrink-0 ${current.mask}`}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Blue Top Feather */}
      <path
        d="M50 42 C 45 25, 42 10, 50 2 C 58 10, 55 25, 50 42 Z"
        fill="#124DA0"
      />
      {/* Yellow Left Feather */}
      <path
        d="M48 42 C 32 30, 18 20, 16 8 C 30 14, 40 28, 48 42 Z"
        fill="#F8C62B"
      />
      {/* Green Right Feather */}
      <path
        d="M52 42 C 68 30, 82 20, 84 8 C 70 14, 60 28, 52 42 Z"
        fill="#159447"
      />
      {/* Mask Base */}
      <path
        d="M18 42 C 30 38, 42 44, 50 48 C 58 44, 70 38, 82 42 C 86 52, 78 64, 50 68 C 22 64, 14 52, 18 42 Z"
        fill="#0C0C0C"
        stroke="#F8C62B"
        strokeWidth="2.5"
      />
      {/* Left Eye Cutout */}
      <ellipse cx="34" cy="50" rx="9" ry="5.5" fill="#124DA0" transform="rotate(-10 34 50)" />
      {/* Right Eye Cutout */}
      <ellipse cx="66" cy="50" rx="9" ry="5.5" fill="#124DA0" transform="rotate(10 66 50)" />
      {/* Center Jewel */}
      <circle cx="50" cy="46" r="3.5" fill="#159447" stroke="#F8C62B" strokeWidth="1" />
    </svg>
  );

  if (variant === 'isotype') {
    return <div className={`inline-flex items-center ${className}`}>{IsotypeBadge}</div>;
  }

  if (variant === 'wordmark') {
    return <div className={`inline-flex items-center ${className}`}>{WordmarkText}</div>;
  }

  if (variant === 'official') {
    return (
      <div className={`inline-flex items-center ${current.gap} ${className}`}>
        {CarnivalMask}
        <div className="flex flex-col">
          <span className="font-outfit font-black text-white leading-none tracking-tight text-lg">
            Samba <span className="text-[#159447]">Brasil</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#F8C62B]">
            by Travel Rock
          </span>
        </div>
      </div>
    );
  }

  // Default 'full' variant: Isotype + Wordmark
  return (
    <div className={`inline-flex items-center ${current.gap} ${className}`}>
      {IsotypeBadge}
      {WordmarkText}
      {showOfficialBadge && (
        <span className="hidden lg:inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#124DA0]/40 text-[#F8C62B] border border-[#124DA0]">
          by Travel Rock
        </span>
      )}
    </div>
  );
};
