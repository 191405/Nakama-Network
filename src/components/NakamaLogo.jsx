import React from 'react';

export const NakamaLogo = ({
    size = 'md',
    className = '',
    showTagline = false,
    variant = 'default' 
}) => {
    const sizes = {
        xs: { nakama: 'text-lg', network: 'text-lg', tagline: 'text-xs' },
        sm: { nakama: 'text-xl', network: 'text-xl', tagline: 'text-xs' },
        md: { nakama: 'text-3xl', network: 'text-3xl', tagline: 'text-sm' },
        lg: { nakama: 'text-5xl', network: 'text-5xl', tagline: 'text-base' },
        xl: { nakama: 'text-6xl', network: 'text-6xl', tagline: 'text-lg' },
        '2xl': { nakama: 'text-7xl', network: 'text-7xl', tagline: 'text-xl' }
    };

    const sizeClass = sizes[size] || sizes.md;

    const variants = {
        default: {
            nakama: 'text-yellow-500',
            network: 'text-white',
            bg: 'transparent'
        },
        dark: {
            nakama: 'text-yellow-500',
            network: 'text-slate-200',
            bg: 'bg-black/80'
        },
        light: {
            nakama: 'text-yellow-600',
            network: 'text-slate-800',
            bg: 'bg-white/90'
        },
        watermark: {
            nakama: 'text-yellow-500/60',
            network: 'text-white/60',
            bg: 'transparent'
        }
    };

    const style = variants[variant] || variants.default;

    return (
        <div className={`inline-flex flex-col items-center ${style.bg} ${className}`}>
            <div className="flex items-baseline gap-1">
                {}
                <span
                    className={`font-black ${sizeClass.nakama} ${style.nakama} tracking-tight`}
                    style={{
                        WebkitTextStroke: variant === 'watermark' ? '1px rgba(0,0,0,0.3)' : '2px #000',
                        textShadow: '0 2px 10px rgba(234, 179, 8, 0.3)'
                    }}
                >
                    Nakama
                </span>

                {}
                <span
                    className={`font-bold ${sizeClass.network} ${style.network} tracking-wide`}
                    style={{
                        textShadow: variant === 'default' ? '0 2px 8px rgba(0,0,0,0.5)' : 'none'
                    }}
                >
                    Network
                </span>
            </div>

            {showTagline && (
                <span className={`${sizeClass.tagline} text-slate-400 font-medium tracking-widest uppercase mt-1`}>
                    Where Legends Clash
                </span>
            )}
        </div>
    );
};

export const NakamaLogoEmail = ({ size = 24 }) => {
    return `
    <span style="font-family: 'Arial Black', sans-serif; font-weight: 900;">
      <span style="
        color: #eab308; 
        font-size: ${size}px;
        -webkit-text-stroke: 1px #000;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">Nakama</span>
      <span style="
        color: #ffffff; 
        font-size: ${size}px;
        font-weight: 700;
        margin-left: 4px;
      ">Network</span>
    </span>
  `;
};

export const NakamaLogoSVG = ({ width = 200, height = 40 }) => (
    <svg width={width} height={height} viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
            </filter>
        </defs>

        {}
        <text
            x="5"
            y="30"
            fontFamily="Arial Black, sans-serif"
            fontSize="28"
            fontWeight="900"
            fill="#eab308"
            stroke="#000"
            strokeWidth="2"
            filter="url(#shadow)"
        >
            Nakama
        </text>

        {}
        <text
            x="115"
            y="30"
            fontFamily="Arial, sans-serif"
            fontSize="24"
            fontWeight="700"
            fill="#ffffff"
            filter="url(#shadow)"
        >
            Network
        </text>
    </svg>
);

export const NakamaLogoAnimated = ({ size = 'lg' }) => {
    return (
        <div className="flex flex-col items-center">
            <NakamaLogo size={size} />
            <div className="mt-4 flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default NakamaLogo;
