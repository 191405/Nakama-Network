

import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';

export const HomeIcon = ({ size = 24, color = '#fff', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 10.5L12 3L21 10.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M5 9V19C5 19.5523 5.44772 20 6 20H9V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V20H18C18.5523 20 19 19.5523 19 19V9"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.2 : 0}
        />
    </Svg>
);

export const DiscoverIcon = ({ size = 24, color = '#fff', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
            cx="12"
            cy="12"
            r="9"
            stroke={color}
            strokeWidth={2}
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.15 : 0}
        />
        <Path
            d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.3 : 0}
        />
        <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
);

export const SocialIcon = ({ size = 24, color = '#fff', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
            cx="9"
            cy="7"
            r="3"
            stroke={color}
            strokeWidth={2}
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.2 : 0}
        />
        <Circle
            cx="15"
            cy="7"
            r="3"
            stroke={color}
            strokeWidth={2}
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.2 : 0}
        />
        <Path
            d="M3 20C3 16.6863 5.68629 14 9 14H15C18.3137 14 21 16.6863 21 20V21H3V20Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.15 : 0}
        />
    </Svg>
);

export const GamesIcon = ({ size = 24, color = '#fff', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M6 11H10M8 9V13"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
        />
        <Circle cx="15" cy="10" r="1" fill={color} />
        <Circle cx="17" cy="12" r="1" fill={color} />
        <Path
            d="M2 12C2 8 4 6 8 6H16C20 6 22 8 22 12C22 16 20 18 16 18H8C4 18 2 16 2 12Z"
            stroke={color}
            strokeWidth={2}
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.15 : 0}
        />
    </Svg>
);

export const ProfileIcon = ({ size = 24, color = '#fff', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
            cx="12"
            cy="8"
            r="4"
            stroke={color}
            strokeWidth={2}
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.2 : 0}
        />
        <Path
            d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20V21H4V20Z"
            stroke={color}
            strokeWidth={2}
            fill={filled ? color : 'none'}
            fillOpacity={filled ? 0.15 : 0}
        />
    </Svg>
);

export const FireIcon = ({ size = 24, color = '#f59e0b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <Stop offset="0%" stopColor="#ef4444" />
                <Stop offset="50%" stopColor="#f97316" />
                <Stop offset="100%" stopColor="#fbbf24" />
            </LinearGradient>
        </Defs>
        <Path
            d="M12 2C12 2 7 7 7 12C7 14.5 8.5 16.5 10 17.5C10 17.5 9 15 10 13C11 11 12 10 12 10C12 10 13 11 14 13C15 15 14 17.5 14 17.5C15.5 16.5 17 14.5 17 12C17 7 12 2 12 2Z"
            fill="url(#fireGrad)"
            stroke={color}
            strokeWidth={1}
        />
        <Path
            d="M12 22C14.5 22 16 20 16 18C16 16 14 14 12 14C10 14 8 16 8 18C8 20 9.5 22 12 22Z"
            fill="#fef3c7"
            stroke="#fbbf24"
            strokeWidth={1}
        />
    </Svg>
);

export const StarIcon = ({ size = 24, color = '#fbbf24', filled = true }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2L14.4 8.8L21.6 9.2L16.2 13.8L17.8 21L12 17.2L6.2 21L7.8 13.8L2.4 9.2L9.6 8.8L12 2Z"
            fill={filled ? color : 'none'}
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
        />
    </Svg>
);

export const TrophyIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M8 21H16M12 17V21M6 3H18V7C18 10.3137 15.3137 13 12 13C8.68629 13 6 10.3137 6 7V3Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 4H4C3 4 2 5 2 6V7C2 8 3 9 4 9H6"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
        />
        <Path
            d="M18 4H20C21 4 22 5 22 6V7C22 8 21 9 20 9H18"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
        />
        <Path d="M10 13L9 17H15L14 13" stroke={color} strokeWidth={2} />
    </Svg>
);

export const SparkleIcon = ({ size = 24, color = '#a855f7' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
            fill={color}
            stroke={color}
            strokeWidth={1}
        />
        <Path
            d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z"
            fill={color}
        />
        <Path
            d="M5 2L5.5 3.5L7 4L5.5 4.5L5 6L4.5 4.5L3 4L4.5 3.5L5 2Z"
            fill={color}
        />
    </Svg>
);

export const BrainIcon = ({ size = 24, color = '#f59e0b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 4C8 4 6 6 6 9C6 11 7 12 7 12C6 13 5 14 5 16C5 19 7 21 10 21H14C17 21 19 19 19 16C19 14 18 13 17 12C17 12 18 11 18 9C18 6 16 4 12 4Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
        />
        <Path d="M12 4V21" stroke={color} strokeWidth={2} />
        <Path d="M9 8C9 8 10 9 12 9C14 9 15 8 15 8" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M9 14C9 14 10 15 12 15C14 15 15 14 15 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

export const HeartIcon = ({ size = 24, color = '#ec4899', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 21C12 21 3 15 3 9C3 6 5 4 8 4C10 4 11.5 5 12 6C12.5 5 14 4 16 4C19 4 21 6 21 9C21 15 12 21 12 21Z"
            fill={filled ? color : 'none'}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ChatIcon = ({ size = 24, color = '#6366f1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 12C21 16.4183 16.9706 20 12 20C10.5 20 9 19.7 8 19.2L3 21L4.5 16.5C3.5 15 3 13.5 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="8" cy="12" r="1" fill={color} />
        <Circle cx="12" cy="12" r="1" fill={color} />
        <Circle cx="16" cy="12" r="1" fill={color} />
    </Svg>
);

export const SearchIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
        <Path d="M21 21L16.5 16.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

export const MoodIcon = ({ size = 24, color = '#ec4899' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
        <Circle cx="9" cy="10" r="1.5" fill={color} />
        <Circle cx="15" cy="10" r="1.5" fill={color} />
        <Path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

export const AnimeIcon = ({ size = 24, color = '#3b82f6' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="4" width="20" height="14" rx="2" stroke={color} strokeWidth={2} />
        <Path d="M10 9L15 12L10 15V9Z" fill={color} />
        <Path d="M8 21H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M12 18V21" stroke={color} strokeWidth={2} />
    </Svg>
);

export const CrownIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 18V12L7 15L12 8L17 15L21 12V18H3Z"
            fill={color}
            fillOpacity={0.3}
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
        />
        <Circle cx="3" cy="12" r="1.5" fill={color} />
        <Circle cx="12" cy="6" r="1.5" fill={color} />
        <Circle cx="21" cy="12" r="1.5" fill={color} />
    </Svg>
);

export const LightningIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
            fill={color}
            fillOpacity={0.3}
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
        />
    </Svg>
);

export const ArrowLeftIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const PlayIcon = ({ size = 24, color = '#fff', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5 3L19 12L5 21V3Z" stroke={color} strokeWidth={2} fill={filled ? color : 'none'} strokeLinejoin="round" />
    </Svg>
);

export const ShareIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2} />
        <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={2} />
        <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={2} />
        <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke={color} strokeWidth={2} />
    </Svg>
);

export const VideoIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke={color} strokeWidth={2} />
        <Path d="M7 2V22" stroke={color} strokeWidth={2} />
        <Path d="M17 2V22" stroke={color} strokeWidth={2} />
        <Path d="M2 12H22" stroke={color} strokeWidth={2} />
        <Path d="M2 7H7" stroke={color} strokeWidth={2} />
        <Path d="M2 17H7" stroke={color} strokeWidth={2} />
        <Path d="M17 17H22" stroke={color} strokeWidth={2} />
        <Path d="M17 7H22" stroke={color} strokeWidth={2} />
    </Svg>
);

export const SendIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22 2L11 13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const UploadIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 8L12 3L7 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 3V15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CheckIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default {
    HomeIcon,
    DiscoverIcon,
    SocialIcon,
    GamesIcon,
    ProfileIcon,
    FireIcon,
    StarIcon,
    TrophyIcon,
    SparkleIcon,
    BrainIcon,
    HeartIcon,
    ChatIcon,
    SearchIcon,
    MoodIcon,
    AnimeIcon,
    CrownIcon,
    LightningIcon,
    ArrowLeftIcon,
    PlayIcon,
    ShareIcon,
    VideoIcon,
    SendIcon,
    UploadIcon,
    CheckIcon,
};
