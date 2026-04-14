import React from 'react';

// Premium rose-gold NakamaLogo
export const NakamaLogo = ({ size = 'md', className = '', showTagline = false }) => {
    const sizes = {
        xs: { nakama: 'text-base', network: 'text-base', tagline: 'text-[9px]' },
        sm: { nakama: 'text-xl', network: 'text-xl', tagline: 'text-xs' },
        md: { nakama: 'text-2xl', network: 'text-2xl', tagline: 'text-xs' },
        lg: { nakama: 'text-4xl', network: 'text-4xl', tagline: 'text-sm' },
        xl: { nakama: 'text-5xl', network: 'text-5xl', tagline: 'text-base' },
        '2xl': { nakama: 'text-7xl', network: 'text-7xl', tagline: 'text-lg' },
    };
    const sz = sizes[size] || sizes.md;

    return (
        <div className={`inline-flex flex-col items-start ${className}`}>
            <div className="flex items-baseline gap-1.5">
                <span
                    className={`font-black ${sz.nakama} tracking-tight leading-none`}
                    style={{
                        background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #fda4af 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 12px rgba(244,63,94,0.4))',
                        fontFamily: 'var(--font-display, "Cinzel", serif)',
                    }}
                >
                    Nakama
                </span>
                <span
                    className={`font-bold ${sz.network} tracking-wide leading-none`}
                    style={{
                        color: '#e2d9f3',
                        fontFamily: 'var(--font-display, "Cinzel", serif)',
                        textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                    }}
                >
                    Network
                </span>
            </div>
            {showTagline && (
                <span
                    className={`${sz.tagline} tracking-[0.3em] uppercase mt-1`}
                    style={{ color: 'rgba(244,114,182,0.5)', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}
                >
                    The Hidden Layer of Anime
                </span>
            )}
        </div>
    );
};

export const NakamaLogoEmail = ({ size = 24 }) => `
  <span style="font-family:'Arial Black',sans-serif;font-weight:900;">
    <span style="color:#f43f5e;font-size:${size}px;">Nakama</span>
    <span style="color:#e2d9f3;font-size:${size}px;font-weight:700;margin-left:4px;">Network</span>
  </span>
`;

export const NakamaLogoSVG = ({ width = 200, height = 40 }) => (
    <svg width={width} height={height} viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>
        </defs>
        <text x="5" y="30" fontFamily="Arial Black,sans-serif" fontSize="26" fontWeight="900" fill="url(#roseGold)">Nakama</text>
        <text x="118" y="30" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700" fill="#e2d9f3">Network</text>
    </svg>
);

export const NakamaLogoAnimated = ({ size = 'lg' }) => (
    <div className="flex flex-col items-center">
        <NakamaLogo size={size} />
        <div className="mt-3 flex gap-1">
            {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#f43f5e', animationDelay: `${i * 0.15}s` }} />
            ))}
        </div>
    </div>
);

export default NakamaLogo;
