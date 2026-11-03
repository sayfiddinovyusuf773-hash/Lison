import React from 'react';
import { BRAND } from '../../config/brand';

interface LisonLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const LisonLogo: React.FC<LisonLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textStyles = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Premium Geometric 3D Emblem */}
      <div
        className={`relative ${iconDimensions[size]} rounded-2xl bg-gradient-to-br from-[#120E3D] via-[#4338CA] to-[#635BFF] p-[1.5px] shadow-md shadow-[#635BFF]/20 group-hover:shadow-lg group-hover:shadow-[#635BFF]/35 group-hover:scale-[1.04] transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full rounded-[14px] overflow-hidden bg-gradient-to-br from-[#1A184D] via-[#4F46E5] to-[#7C3AED] relative flex items-center justify-center">
          {/* Subtle Inner Glow Highlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />

          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1"
          >
            <defs>
              <linearGradient id="lisonRibbon" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#DDD6FE" />
              </linearGradient>
              <linearGradient id="sparkGold" x1="24" y1="9" x2="30" y2="15" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>

            {/* Translucent Dialogue Speech Wave */}
            <path
              d="M9.5 19.5C9.5 13.7 14.2 9 20 9C25.8 9 30.5 13.7 30.5 19.5C30.5 25.3 25.8 30 20 30C18.1 30 16.3 29.5 14.7 28.6L9.5 30.5L11.1 25.4C10.1 23.7 9.5 21.7 9.5 19.5Z"
              fill="white"
              fillOpacity="0.14"
            />

            {/* Bold Geometric "L" Symbol */}
            <path
              d="M14 12V24C14 25.1 14.9 26 16 26H25.5C26.1 26 26.5 25.5 26.5 25C26.5 24.4 26.1 24 25.5 24H16.5V12C16.5 11.4 16.1 11 15.5 11C14.9 11 14 11.4 14 12Z"
              fill="url(#lisonRibbon)"
              className="drop-shadow-sm"
            />

            {/* Four-Point AI Spark (Opportunity & Intelligence) */}
            <path
              d="M25 12.5C26.1 12.5 27 11.6 27 10.5C27 11.6 27.9 12.5 29 12.5C27.9 12.5 27 13.4 27 14.5C27 13.4 26.1 12.5 25 12.5Z"
              fill="url(#sparkGold)"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>

      {/* Typography: Wordmark + Tagline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 leading-none">
          <span
            className={`${textStyles[size]} font-black tracking-[0.06em] text-[#171A2B] dark:text-white transition-colors duration-200`}
          >
            {BRAND.name}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] dark:bg-[#8B7CFF] inline-block animate-pulse" />
        </div>

        {showTagline && (
          <span className="text-[11px] font-medium text-[#5A627A] dark:text-[#9DA6BD] mt-1 tracking-tight leading-none hidden sm:block">
            {BRAND.tagline}
          </span>
        )}
      </div>
    </div>
  );
};
