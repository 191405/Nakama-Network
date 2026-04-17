/**
 * ╔══════════════════════════════════════════════════╗
 * ║  NAKAMA NETWORK — Motion Presets                 ║
 * ║  Reusable Framer Motion variants + factories     ║
 * ╚══════════════════════════════════════════════════╝
 */
import { duration, ease, stagger, depth } from './motionTokens';

/* ════════════════════════════════════════════════════
   PAGE TRANSITIONS
   ════════════════════════════════════════════════════ */
export const pageTransition = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: duration.slow, ease: ease.standard },
};

/* ════════════════════════════════════════════════════
   REVEAL VARIANTS (scroll-triggered)
   ════════════════════════════════════════════════════ */
export const fadeUp = {
  hidden:  { opacity: 0, y: depth.reveal.y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.standard },
  },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.standard },
  },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: depth.reveal.scale },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: ease.emphasized },
  },
};

export const blurIn = {
  hidden:  { opacity: 0, filter: `blur(${depth.reveal.blur})`, y: depth.reveal.y * 0.5 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: duration.slow, ease: ease.emphasized },
  },
};

/* ════════════════════════════════════════════════════
   STAGGER CONTAINERS
   ════════════════════════════════════════════════════ */
export const staggerContainer = (speed = 'normal') => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger[speed] || stagger.normal,
      delayChildren: 0.05,
    },
  },
});

export const staggerItem = {
  hidden:  { opacity: 0, y: depth.reveal.y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.standard },
  },
};

/* ════════════════════════════════════════════════════
   MICRO-INTERACTIONS
   ════════════════════════════════════════════════════ */

// Card hover — lift + subtle glow
export const cardHover = {
  whileHover: {
    y: depth.hover.lift.y,
    scale: depth.hover.lift.scale,
    transition: { duration: duration.fast, ease: ease.standard },
  },
  whileTap: {
    scale: depth.tap.press.scale,
    transition: { duration: duration.instant },
  },
};

// Button feedback
export const buttonTap = {
  whileTap: {
    scale: depth.tap.press.scale,
    transition: { duration: duration.instant },
  },
};

// Modal / Drawer
export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: duration.fast },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.96, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.96, y: 20 },
  transition: { ...ease.spring.snappy },
};

export const drawerSlide = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit:    { y: '100%' },
  transition: { ...ease.spring.gentle },
};

// Tooltip / Dropdown — quick directional reveal
export const dropdownReveal = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: duration.fast, ease: ease.standard },
};

/* ════════════════════════════════════════════════════
   HERO / CINEMATIC
   ════════════════════════════════════════════════════ */
export const heroText = {
  hidden:  { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.cinematic, ease: ease.emphasized },
  },
};

export const heroBg = {
  initial: { opacity: 0, scale: 1.06 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 1.2, ease: ease.standard },
};
