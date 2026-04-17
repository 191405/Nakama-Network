/**
 * <Reveal> — Scroll-triggered animation wrapper
 *
 * Usage:
 *   <Reveal>           -> default fadeUp, once
 *   <Reveal preset="scaleIn" replay>  -> scaleIn, replays on re-enter
 *   <Reveal stagger="fast">
 *     <div>child 1</div>
 *     <div>child 2</div>
 *   </Reveal>
 */
import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, fadeIn, scaleIn, blurIn, staggerContainer, staggerItem } from './motionPresets';
import { duration, ease, stagger as staggerTokens } from './motionTokens';

const presetMap = {
  fadeUp,
  fadeIn,
  scaleIn,
  blurIn,
};

const Reveal = ({
  children,
  preset = 'fadeUp',
  stagger = null,        // null | 'fast' | 'normal' | 'slow'
  once = true,           // animate only once by default
  replay = false,        // explicit override for `once`
  margin = '-60px',      // how early to trigger
  delay = 0,
  className = '',
  as = 'div',
  ...rest
}) => {
  const shouldRepeat = replay ? false : once;
  const variants = presetMap[preset] || fadeUp;
  const MotionTag = motion[as] || motion.div;

  // If stagger mode: wrap children in stagger container and each child in stagger item
  if (stagger) {
    const containerVariants = staggerContainer(stagger);
    return (
      <MotionTag
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: shouldRepeat, margin }}
        className={className}
        {...rest}
      >
        {React.Children.map(children, (child, i) => {
          if (!React.isValidElement(child)) return child;
          return (
            <motion.div
              key={child.key || i}
              variants={staggerItem}
            >
              {child}
            </motion.div>
          );
        })}
      </MotionTag>
    );
  }

  // Standard single-element reveal
  const delayedVariants = delay > 0
    ? {
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            ...variants.visible.transition,
            delay,
          },
        },
      }
    : variants;

  return (
    <MotionTag
      variants={delayedVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: shouldRepeat, margin }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
};

export default Reveal;
