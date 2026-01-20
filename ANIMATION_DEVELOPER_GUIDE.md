# 🎬 Animation System Developer Guide

## Quick Start

### Using Framer Motion Animations

#### Basic Component Animation
```jsx
import { motion } from 'framer-motion';

// Simple fade-in effect
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content
</motion.div>
```

#### Hover Effects
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 100 }}
>
  Click Me
</motion.button>
```

#### Spring Physics
```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 60,
    damping: 20,
    mass: 1
  }}
>
  Bouncy Content
</motion.div>
```

---

## CSS Animation Classes

### Available Animation Classes

#### Floating & Motion
```jsx
// Smooth floating animation (6s)
<div className="float-smooth-enhanced">Content</div>

// Vertical bobbing (5s)
<div className="enhanced-vertical-float">Content</div>

// Complex particle motion (8s)
<div className="floating-particles">Content</div>
```

#### Glowing Effects
```jsx
// Living breathing glow (4s)
<div className="breathing-glow border border-neon-blue">Content</div>

// Pulsing glow border (3s)
<div className="glow-border-pulse border border-neon-blue">Content</div>

// Continuous rotation with breathing (6s)
<div className="smooth-rotation">Content</div>
```

#### Shimmer & Pulse
```jsx
// Liquid shimmer effect (3s)
<div className="liquid-shimmer bg-gradient-to-r from-neon-blue to-neon-purple">Content</div>

// Quantum opacity pulse (3s)
<div className="quantum-pulse">Content</div>

// Gradient pulse (4s)
<div className="gradient-pulse-enhanced bg-gradient-to-r from-neon-blue to-neon-purple">Content</div>
```

#### Text Effects
```jsx
// Text reveal with cascade (0.8s)
<p className="text-reveal-cascade">Revealing text</p>

// Holographic text effect
<p className="neon-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text">
  Holographic
</p>

// Glitch effect (0.5s)
<span className="glitch-enhanced">Glitch</span>
```

#### Entrance Effects
```jsx
// Smooth scale and fade (0.6s)
<div className="smooth-scale-fade">Content</div>

// Ripple effect (1.5s)
<div className="advanced-ripple">Content</div>

// Color shift effect (6s)
<div className="fluid-color-shift">Content</div>
```

---

## Common Animation Patterns

### Pattern 1: Card Entrance with Stagger

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, index) => (
    <motion.div key={index} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Pattern 2: Interactive Button with Shimmer

```jsx
<motion.button
  className="relative overflow-hidden"
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.95 }}
>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
    animate={{ x: ['-100%', '100%'] }}
    transition={{ duration: 2 }}
  />
  Click Me
</motion.button>
```

### Pattern 3: Floating Particle Background

Use the `CinematicBackground` component which already includes:
- 250 particles with physics simulation
- Mouse interaction repulsion
- Intelligent connection rendering
- Optimized canvas rendering

```jsx
<div className="relative">
  <CinematicBackground />
  {/* Your content on top */}
</div>
```

### Pattern 4: Page Route Transitions

Automatically handled by `PageWrapper` in App.jsx:
- Smooth fade-in on route enter
- Scale down on exit
- Y-axis animation for direction indication

```jsx
// Routes automatically wrapped with page transitions
<Routes>
  <Route path="/hub" element={<Hub />} />
  <Route path="/stream" element={<Stream />} />
</Routes>
```

### Pattern 5: Glow Text Effect

```jsx
<motion.h1
  className="neon-text"
  animate={{
    textShadow: [
      '0 0 20px rgba(0, 212, 255, 0.8)',
      '0 0 40px rgba(180, 0, 255, 0.8)',
      '0 0 20px rgba(0, 212, 255, 0.8)',
    ]
  }}
  transition={{ duration: 3, repeat: Infinity }}
>
  Glowing Text
</motion.h1>
```

---

## Animation Configuration Reference

### Spring Physics Presets

#### Bouncy (Default)
```js
transition={{ 
  type: "spring", 
  stiffness: 100, 
  damping: 10 
}}
```
Best for: Playful, energetic interactions

#### Smooth (Recommended)
```js
transition={{ 
  type: "spring", 
  stiffness: 60, 
  damping: 20 
}}
```
Best for: Natural, refined movements

#### Tight Control
```js
transition={{ 
  type: "spring", 
  stiffness: 300, 
  damping: 40 
}}
```
Best for: Precise, controlled animations

#### Ease Functions
```js
// Standard timing functions
transition={{ duration: 0.5, ease: "easeOut" }}      // Fast start, slow end
transition={{ duration: 0.5, ease: "easeIn" }}       // Slow start, fast end
transition={{ duration: 0.5, ease: "easeInOut" }}    // Smooth both ends
transition={{ duration: 0.5, ease: "linear" }}       // Constant speed

// Cubic bezier custom
transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
```

---

## CSS Animation Parameters

### Duration Guidelines
- **Micro interactions** (0.2s - 0.3s): Button clicks, icon changes
- **UI transitions** (0.4s - 0.8s): Card hovers, modal opens
- **Page changes** (0.5s - 1s): Route transitions
- **Background loops** (3s - 8s): Particles, gradients
- **Long loops** (15s - 20s): Slow moving backgrounds

### Timing Functions
```css
/* Predefined functions */
animation-timing-function: ease-out;        /* Recommended for enters */
animation-timing-function: ease-in-out;     /* Smooth throughout */
animation-timing-function: linear;          /* Continuous rotation */

/* Custom cubic-bezier */
animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* Material design */
animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy */
```

---

## Performance Tips

### ✅ DO
- Use `transform` (translate, rotate, scale) and `opacity` for animations
- Apply animations to pseudo-elements or child elements
- Use `will-change` for complex animations
- Batch animations together when possible
- Test on lower-end devices

```css
/* Good: GPU-accelerated */
.animated {
  animation: float-smooth-enhanced 6s ease-in-out infinite;
}

/* Good: Multiple properties */
@keyframes efficient {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-20px) scale(1.05); opacity: 1; }
}
```

### ❌ DON'T
- Animate `width`, `height`, `left`, `top` (causes layout thrashing)
- Create too many simultaneous animations (60fps budget)
- Animate `box-shadow` frequently (expensive)
- Disable hardware acceleration

```css
/* Bad: Layout-triggering */
@keyframes inefficient {
  0% { width: 100px; }
  100% { width: 200px; }
}

/* Bad: Expensive property */
.expensive {
  animation: shadow-pulse 3s infinite;
}
@keyframes shadow-pulse {
  0% { box-shadow: 0 0 10px rgba(0,0,0,0.5); }
  100% { box-shadow: 0 0 50px rgba(0,0,0,0.5); }
}
```

---

## Responsive Animation

### Mobile Considerations

```jsx
// Reduce animations on mobile for better performance
const isTouch = window.matchMedia("(pointer: coarse)").matches;

<motion.div
  whileHover={!isTouch ? { scale: 1.05 } : undefined}
  whileTap={{ scale: 0.95 }}
>
  Interactive Content
</motion.div>
```

### Disable Motion for Accessibility

```css
/* Already implemented in index.css */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### High Contrast Support

```css
/* Already implemented in index.css */
@media (prefers-contrast: more) {
  .glass-panel {
    border-color: rgba(0, 212, 255, 0.6);
  }
  
  .neon-text {
    text-shadow: 
      0 0 15px rgba(0, 212, 255, 1),
      0 0 30px rgba(0, 212, 255, 0.8);
  }
}
```

---

## Debugging Animations

### Chrome DevTools
1. Open DevTools > Animations tab
2. Play/pause animations
3. Adjust playback speed (slow down to 25% for inspection)
4. Inspect animation timeline

### Common Issues

**Issue: Animation jank/stuttering**
```js
// Solution: Check FPS and ensure transform-only animations
// Use Chrome DevTools > Performance tab to profile
```

**Issue: Animation not playing**
```js
// Check: Is element visible? Is z-index correct?
// Check: Is prefers-reduced-motion enabled?
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

**Issue: Animation too slow/fast**
```js
// Adjust duration and easing
transition={{ duration: 0.5, ease: "easeOut" }}
                    // Reduce ↑ for faster
```

---

## Creating Custom Animations

### Create a New CSS Keyframe Animation

```css
/* In src/index.css */
@keyframes custom-float {
  0%, 100% {
    transform: translateY(0) rotateX(0);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-30px) rotateX(20deg);
    opacity: 1;
  }
}

.custom-float {
  animation: custom-float 5s ease-in-out infinite;
}
```

### Create a Framer Motion Variant Set

```js
const customVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    rotate: 5,
    transition: { duration: 0.3 }
  }
};

<motion.button
  variants={customVariants}
  initial="hidden"
  animate="visible"
  whileHover="hover"
>
  Custom Animation
</motion.button>
```

---

## Advanced Patterns

### Orchestrated Sequence

```jsx
<motion.div>
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0 }}
  />
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  />
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  />
</motion.div>
```

### Shared Layout Animation

```jsx
<motion.div layoutId="active-indicator" />
// Automatically animates between different positions
// when layoutId changes
```

### Gesture-Based Control

```jsx
<motion.div
  drag
  dragElastic={0.2}
  onDragEnd={(event, info) => {
    // Handle drag end
  }}
>
  Draggable Content
</motion.div>
```

---

## Color Animation Reference

### Neon Colors
```css
Primary Blue: #00d4ff
Purple: #b400ff
Pink: #ff00ea
```

### Common Gradient Combinations
```jsx
// Blue to Purple
className="bg-gradient-to-r from-neon-blue to-neon-purple"

// Purple to Pink
className="bg-gradient-to-r from-neon-purple to-neon-pink"

// Rainbow
className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
```

---

## Resources & References

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [MDN Web Docs - CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Web Performance Guidelines](https://web.dev/performance/)
- [Accessibility - Motion](https://www.a11y-101.com/design/animations-and-transitions)

---

*This guide keeps evolving. For latest best practices, check the UI Enhancement Summary.*
