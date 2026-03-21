/**
 * Motion Hooks - Accessibility & Performance
 * 
 * Custom hooks for motion design with automatic accessibility support.
 * Every hook automatically respects prefers-reduced-motion.
 * 
 * ✅ Respects prefers-reduced-motion media query
 * ✅ 60 FPS safe animation configurations
 * ✅ transform + opacity only (GPU-accelerated)
 */

'use client';

import { useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { MOTION_CONFIG } from './animation-config';

// ============================================================================
// MOTION PREFERENCES HOOK
// ============================================================================

/**
 * useMotionPreferences
 * 
 * Gets user motion preferences and returns safe animation configs.
 * Automatically disables intensive animations for motion-sensitive users.
 * 
 * @returns {Object} Motion settings with accessibility baked in
 * 
 * @example
 * const { shouldReduceMotion, fast, spring } = useMotionPreferences();
 * 
 * <motion.div
 *   animate={{ scale: 1 }}
 *   transition={shouldReduceMotion ? { duration: 0 } : spring}
 * >
 *   Content
 * </motion.div>
 */
export function useMotionPreferences() {
  const shouldReduceMotion = useReducedMotion();

  return {
    // Whether animations should be reduced/disabled
    shouldReduceMotion,

    // Quick animations (100ms)
    fast: {
      duration: shouldReduceMotion ? 0 : 0.1,
      ease: 'easeOut',
    },

    // Standard animations (200ms)
    normal: {
      duration: shouldReduceMotion ? 0 : 0.2,
      ease: 'easeOut',
    },

    // Slow animations (300ms)
    slow: {
      duration: shouldReduceMotion ? 0 : 0.3,
      ease: 'easeOut',
    },

    // Spring physics (disable bouncing for motion-sensitive)
    spring: {
      type: shouldReduceMotion ? ('tween' as const) : ('spring' as const),
      damping: shouldReduceMotion ? 20 : 20,
      stiffness: shouldReduceMotion ? 0 : 300,
      bounce: shouldReduceMotion ? 0 : 0.3,
    },

    // Exit animations (fast dismissal)
    exit: {
      duration: shouldReduceMotion ? 0 : 0.15,
      ease: 'easeIn',
    },
  };
}

// ============================================================================
// STAGGER ANIMATION HOOK
// ============================================================================

interface UseStaggerAnimationOptions {
  staggerDelay?: number;
  itemDuration?: number;
}

/**
 * useStaggerAnimation
 * 
 * Creates staggered child animations with automatic accessibility support.
 * Perfect for list items, form fields, dashboard cards.
 * 
 * @param options - Configuration (staggerDelay, itemDuration)
 * @returns {Object} Container and item variants
 * 
 * @example
 * const { containerVariants, itemVariants } = useStaggerAnimation({
 *   staggerDelay: 0.05,
 *   itemDuration: 0.3,
 * });
 * 
 * <motion.div variants={containerVariants} initial="hidden" animate="show">
 *   {items.map((item, i) => (
 *     <motion.div key={i} variants={itemVariants}>{item}</motion.div>
 *   ))}
 * </motion.div>
 */
export function useStaggerAnimation({
  staggerDelay = 0.05,
  itemDuration = 0.3,
} = {} as UseStaggerAnimationOptions) {
  const { shouldReduceMotion } = useMotionPreferences();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: 0,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : itemDuration,
        ease: 'easeOut',
      },
    },
  };

  return {
    containerVariants,
    itemVariants,
    shouldReduceMotion,
  };
}

// ============================================================================
// HOVER ANIMATION HOOK
// ============================================================================

interface UseHoverAnimationOptions {
  scale?: number;
  shadowLift?: number;
}

/**
 * useHoverAnimation
 * 
 * Returns gesture configs for hover, tap, focus states.
 * Respects prefers-reduced-motion automatically.
 * 
 * @param options - Configuration (scale, shadowLift)
 * @returns {Object} Gesture animations
 * 
 * @example
 * const { hover, tap, focus } = useHoverAnimation({ scale: 1.05 });
 * 
 * <motion.button
 *   whileHover={hover}
 *   whileTap={tap}
 *   whileFocus={focus}
 * >
 *   Click me
 * </motion.button>
 */
export function useHoverAnimation({
  scale = 1.05,
  shadowLift = 4,
} = {} as UseHoverAnimationOptions) {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    hover: shouldReduceMotion ? {} : { scale },
    tap: shouldReduceMotion ? {} : { scale: 0.95 },
    focus: shouldReduceMotion ? {} : { scale },
    // Optional: shadow lift for depth (requires custom CSS)
    shadowLiftPx: shadowLift,
  };
}

// ============================================================================
// SCROLL TRIGGER ANIMATION HOOK
// ============================================================================

interface UseScrollTriggerAnimationOptions {
  threshold?: number;
  once?: boolean;
}

/**
 * useScrollTriggerAnimation
 * 
 * Returns whileInView props for scroll-triggered animations.
 * Respects prefers-reduced-motion automatically.
 * 
 * @param options - Configuration (threshold, once)
 * @returns {Object} Scroll animation config
 * 
 * @example
 * const scrollConfig = useScrollTriggerAnimation();
 * 
 * <motion.div
 *   initial={{ opacity: 0, y: 50 }}
 *   whileInView={{ opacity: 1, y: 0 }}
 *   viewport={scrollConfig.viewport}
 * >
 *   Animates when scrolled into view
 * </motion.div>
 */
export function useScrollTriggerAnimation({
  threshold = 0.2,
  once = true,
} = {} as UseScrollTriggerAnimationOptions) {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    viewport: {
      once,
      amount: threshold,
    },
    shouldReduceMotion,
    transition: shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.3, ease: 'easeOut' },
  };
}

// ============================================================================
// LOADING ANIMATION HOOK
// ============================================================================

/**
 * useLoadingAnimation
 * 
 * Returns spinner animation config (60 FPS safe rotation).
 * Respects prefers-reduced-motion automatically.
 * 
 * @returns {Object} Loading spinner animation
 * 
 * @example
 * const spinner = useLoadingAnimation();
 * 
 * <motion.div
 *   animate={{ rotate: 360 }}
 *   transition={spinner.transition}
 * >
 *   ⏳
 * </motion.div>
 */
export function useLoadingAnimation() {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    transition: shouldReduceMotion
      ? { duration: 0 }
      : {
          type: 'tween',
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
        },
    shouldReduceMotion,
  };
}

// ============================================================================
// SUCCESS/ERROR FEEDBACK HOOK
// ============================================================================

/**
 * useFeedbackAnimation
 * 
 * Returns animation configs for success/error states.
 * Success: brief scale pulse. Error: shake animation.
 * Respects prefers-reduced-motion automatically.
 * 
 * @returns {Object} Feedback animations
 * 
 * @example
 * const { successVariants, errorVariants } = useFeedbackAnimation();
 * 
 * <motion.div variants={state === 'success' ? successVariants : errorVariants}>
 *   Feedback message
 * </motion.div>
 */
export function useFeedbackAnimation() {
  const { shouldReduceMotion } = useMotionPreferences();

  const successVariants: Variants = {
    animate: shouldReduceMotion
      ? {}
      : {
          scale: [1, 1.1, 1],
          transition: { duration: 0.4, ease: 'easeOut' },
        },
  };

  const errorVariants: Variants = {
    animate: shouldReduceMotion
      ? {}
      : {
          x: [-8, 8, -8, 0],
          transition: { duration: 0.4, ease: 'easeOut' },
        },
  };

  return {
    successVariants,
    errorVariants,
    shouldReduceMotion,
  };
}
