/**
 * ╔══════════════════════════════════════════════════╗
 * ║  NAKAMA NETWORK — Motion Design Tokens          ║
 * ║  Single source of truth for all motion values.   ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Principles:
 *   1. Calm — motion supports comprehension, never distracts
 *   2. Responsive — interactions acknowledge input instantly
 *   3. Premium — subtle depth and polish convey quality
 */

/* ── Timing Scale (seconds) ── */
export const duration = {
  instant:  0.12,   // micro-feedback (button press)
  fast:     0.22,   // tooltips, dropdowns, small reveals
  normal:   0.36,   // cards, modals, section reveals
  slow:     0.5,    // page transitions, hero elements
  cinematic: 0.8,   // flagship hero choreography
};

/* ── Easing Tokens ── */
export const ease = {
  // Standard — the default for most UI motion
  standard:    [0.22, 1, 0.36, 1],
  // Emphasized — for entrances that need presence
  emphasized:  [0.16, 1, 0.3, 1],
  // Exit — quick, getting out of the way
  exit:        [0.4, 0, 1, 1],
  // Spring config for Framer Motion
  spring: {
    gentle:  { type: 'spring', stiffness: 260, damping: 25 },
    snappy:  { type: 'spring', stiffness: 400, damping: 28 },
    bouncy:  { type: 'spring', stiffness: 300, damping: 18 },
  },
};

/* ── Stagger Rules ── */
export const stagger = {
  fast:   0.04,   // dense grids (6+ items)
  normal: 0.06,   // standard lists
  slow:   0.1,    // hero feature cards
};

/* ── Depth Scale (transform values) ── */
export const depth = {
  hover: {
    lift:   { y: -4, scale: 1.015 },
    subtle: { y: -2, scale: 1.005 },
    glow:   { y: -3, scale: 1.01 },
  },
  tap: {
    press: { scale: 0.97 },
    light: { scale: 0.985 },
  },
  reveal: {
    y:       16,     // vertical travel distance for reveals
    blur:    '6px',  // blur amount during entrance
    scale:   0.97,   // scale-in start value
  },
  parallax: {
    maxOffset: 30,   // px — never exceed this for perf
  },
};

/* ── Max simultaneous animations ── */
export const limits = {
  maxStaggerChildren: 12,
  maxSimultaneous: 8,
};
