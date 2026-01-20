# 🌗 Animation Quick Reference Card

## Essential Imports
```jsx
import { motion, AnimatePresence } from 'framer-motion';
```

---

## Component Animation Snippets

### Fade In
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
/>
```

### Scale & Fade
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 60 }}
/>
```

### Slide In (Y-axis)
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

### Slide In (X-axis)
```jsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
/>
```

### Hover Scale
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### Rotate on Hover
```jsx
<motion.div
  whileHover={{ rotate: 10, scale: 1.05 }}
/>
```

### Continuous Animation
```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
/>
```

### Staggered List
```jsx
<motion.ul variants={{ container: { staggerChildren: 0.1 } }}>
  {items.map((item) => (
    <motion.li
      key={item}
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.li>
  ))}
</motion.ul>
```

---

## CSS Animation Classes

### Floating Effects
- `float-smooth-enhanced` (6s)
- `enhanced-vertical-float` (5s)
- `floating-particles` (8s)

### Glow Effects
- `breathing-glow` (4s)
- `glow-border-pulse` (3s)
- `smooth-rotation` (6s)

### Shimmer Effects
- `liquid-shimmer` (3s)
- `enhanced-shimmer` (1.5s)
- `liquid-border` (3s)

### Text Effects
- `text-reveal-cascade` (0.8s)
- `holographic-text` (4s)
- `glitch-enhanced` (0.5s)
- `neon-text` (static glow)

### Pulse Effects
- `quantum-pulse` (3s)
- `gradient-pulse-enhanced` (4s)
- `blur-pulse` (3s)
- `fluid-pulse` (2s)

### Entrance Effects
- `smooth-scale-fade` (0.6s)
- `advanced-ripple` (1.5s)
- `fade-cascade` (0.8s)

### Other
- `fluid-color-shift` (6s)
- `morph` (4s)
- `wave` (3s)

---

## Transition Timing Presets

### Slow & Smooth (Refined)
```js
transition={{ duration: 0.8, ease: "easeOut" }}
```

### Medium & Natural (Recommended)
```js
transition={{ 
  type: "spring", 
  stiffness: 60, 
  damping: 20 
}}
```

### Quick & Responsive
```js
transition={{ duration: 0.3, ease: "easeOut" }}
```

### Bouncy & Playful
```js
transition={{ 
  type: "spring", 
  stiffness: 100, 
  damping: 10 
}}
```

### Continuous Loop
```js
transition={{ 
  duration: 3, 
  repeat: Infinity, 
  ease: "easeInOut" 
}}
```

---

## Common Component Patterns

### Animated Card
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02, y: -5 }}
  className="glass-panel rounded-2xl p-6"
/>
```

### Animated Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="cyber-button"
/>
```

### Animated Icon
```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
>
  <Icon size={24} />
</motion.div>
```

### Floating Label
```jsx
<motion.label
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 3, repeat: Infinity }}
/>
```

### Loading Spinner
```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  className="w-8 h-8 border-2 border-neon-blue rounded-full border-t-transparent"
/>
```

---

## Animation Library Reference

### Framer Motion Variants
```js
// Variant object structure
{
  hidden: { property: value },
  visible: { property: value },
  hover: { property: value },
  tap: { property: value }
}
```

### Motion Values
- `opacity`: 0-1
- `scale`: multiplier (1 = normal, 1.05 = 5% larger)
- `x`, `y`: pixels or percentages
- `rotate`: degrees
- `skewX`, `skewY`: degrees
- `transformOrigin`: string

### Transitions
- `duration`: milliseconds
- `delay`: milliseconds
- `ease`: "linear", "easeIn", "easeOut", "easeInOut"
- `repeat`: Infinity or number
- `repeatDelay`: milliseconds
- `type`: "spring" or "tween"
- `stiffness`: spring stiffness (0-500)
- `damping`: spring damping (0-100)

---

## Z-Index Hierarchy

```
9999 - Entry animation overlay
 20  - Scanline effects
 10  - Grid & nebula backgrounds
  5  - Animated gradient overlays
  1  - Liquid background
  0  - Cinematic particles & content
 -1  - Base background
```

---

## Color Codes

| Color | Code | Usage |
|-------|------|-------|
| Neon Blue | `#00d4ff` | Primary glow |
| Neon Purple | `#b400ff` | Secondary |
| Neon Pink | `#ff00ea` | Accent |
| Cyber Black | `#030014` | Background |
| Void Gray | `#1a1a2e` | Secondary background |

---

## Useful Utilities

### Check Motion Preference
```js
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReduced) {
  // Apply animations
}
```

### Get Device Pixel Ratio
```js
const dpr = window.devicePixelRatio || 1;
// Use for canvas scaling
```

### Mobile Detection
```js
const isMobile = window.matchMedia(
  "(pointer: coarse)"
).matches;
```

---

## Best Practices

✅ **DO**
- Use `transform` and `opacity` only
- Keep animations under 1s for UI interactions
- Test on mobile devices
- Respect `prefers-reduced-motion`
- Use `will-change` for complex animations
- Batch animations together

❌ **DON'T**
- Animate layout properties (width, height, left, top)
- Create animations longer than needed
- Ignore accessibility preferences
- Stack too many animations
- Animate `box-shadow` frequently
- Animate on every frame unnecessarily

---

## Performance Targets

- **FPS**: 60fps target (16.7ms per frame)
- **Canvas Particles**: 250 maximum
- **Simultaneous Animations**: Keep under 10
- **CSS Animations**: Unlimited (GPU accelerated)
- **Page Transition**: 300-500ms

---

## Debugging Checklist

- [ ] Animation plays on first render?
- [ ] Animation respects `prefers-reduced-motion`?
- [ ] No layout shift during animation?
- [ ] Frame rate stays at 60fps?
- [ ] Animation works on mobile?
- [ ] Focus indicators visible?
- [ ] Color contrast adequate?
- [ ] Performance acceptable?

---

## Quick Command Reference

### Install Framer Motion
```bash
npm install framer-motion
```

### Update Tailwind Config (if needed)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00d4ff',
        'neon-purple': '#b400ff',
        'neon-pink': '#ff00ea',
      }
    }
  }
}
```

### Check FPS (Dev Console)
```js
performance.measureUserAgentSpecificMemory()
```

---

## File Locations

| File | Purpose |
|------|---------|
| `src/index.css` | CSS animations & styles |
| `src/App.jsx` | Page transitions |
| `src/components/Navbar.jsx` | Navigation animations |
| `src/components/Login.jsx` | Login UI animations |
| `src/components/EntryAnimation.jsx` | Splash screen |
| `src/components/CinematicBackground.jsx` | Particle system |
| `src/components/LiquidBackground.jsx` | Wave effects |

---

**Last Updated**: UI Enhancement Phase Complete
**Version**: 2.0
**Status**: ✅ Production Ready
