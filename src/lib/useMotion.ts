/**
 * Motion & Animation Hooks
 * 
 * Custom hooks for motion design with automatic accessibility support.
 * Every hook automatically respects prefers-reduced-motion.
 */

'use client';

import { useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';

// ============================================================================
// CORE HOOKS
// ============================================================================

/**
 * useMotionPreferences
 * 
 * Get user motion preferences and current motion settings.
 * Automatically disables animations for users with prefers-reduced-motion.
 * 
 * Returns duration: 0 if motion disabled, otherwise normal timing.
 */
export const useMotionPreferences = () => {
  const shouldReduceMotion = useReducedMotion();

  return {
    // Whether animations should be reduced/disabled
    shouldReduceMotion,
    
    // Presets for fast animations
    fast: {
      duration: shouldReduceMotion ? 0 : 0.1,
      ease: 'easeOut',
    },

    // Presets for standard/medium animations
    normal: {
      duration: shouldReduceMotion ? 0 : 0.2,
      ease: 'easeOut',
    },

    // Presets for slow/entrance animations
    slow: {
      duration: shouldReduceMotion ? 0 : 0.3,
      ease: 'easeOut',
    },

    // Spring physics (disable bouncing on reduced motion)
    spring: {
      type: shouldReduceMotion ? ('tween' as const) : ('spring' as const),
      damping: shouldReduceMotion ? 20 : 25,
      stiffness: 300,
      bounce: shouldReduceMotion ? 0 : 0.4,
    },
  };
};

// ============================================================================
// STAGGER HOOKS
// ============================================================================

/**
 * useStaggerAnimation
 * 
 * Create staggered child animations with automatic accessibility support.
 * 
 * Example:
 * ```tsx
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
 * ```
 */
export const useStaggerAnimation = ({
  staggerDelay = 0.05,
  itemDuration = 0.3,
} = {}) => {
  const { shouldReduceMotion, fast } = useMotionPreferences();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : 0.0,
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

  return { containerVariants, itemVariants };
};

/**
 * useStaggerSlideAnimation
 * 
 * Create staggered slide-in animations (horizontal or vertical).
 * Useful for lists, dropdowns, and slideover panels.
 */
export const useStaggerSlideAnimation = ({
  direction = 'left' as const,
  staggerDelay = 0.05,
  itemDuration = 0.3,
  distance = 20,
} = {}) => {
  const { shouldReduceMotion } = useMotionPreferences();

  const getInitialValue = () => {
    if (shouldReduceMotion) return 0;
    switch (direction) {
      case 'left':
        return -distance;
      case 'right':
        return distance;
      case 'up':
        return -distance;
      case 'down':
        return distance;
      default:
        return 0;
    }
  };

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, [axis]: getInitialValue() },
    show: {
      opacity: 1,
      [axis]: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : itemDuration,
        ease: 'easeOut',
      },
    },
  };

  return { containerVariants, itemVariants };
};

// ============================================================================
// LOADING STATE HOOKS
// ============================================================================

/**
 * useLoadingAnimation
 * 
 * Get animation config for loading states (spinner, skeleton pulse, etc).
 * Respects prefers-reduced-motion by disabling animation.
 * 
 * Example:
 * ```tsx
 * const loadingAnimation = useLoadingAnimation();
 * 
 * <motion.div animate={loadingAnimation.spinner}>
 *   <Loader />
 * </motion.div>
 * ```
 */
export const useLoadingAnimation = () => {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    // Rotating spinner
    spinner: shouldReduceMotion
      ? {}
      : {
          rotate: 360,
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          },
        },

    // Pulsing opacity (skeleton loading)
    pulse: shouldReduceMotion
      ? {}
      : {
          opacity: [0.5, 1, 0.5],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },

    // Shimmer effect (left to right)
    shimmer: shouldReduceMotion
      ? {}
      : {
          backgroundPosition: ['200% center', '-200% center'],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          },
        },
  };
};

// ============================================================================
// STATE CHANGE HOOKS
// ============================================================================

/**
 * useStateChangeAnimation
 * 
 * Get animation for state transitions (success, error, etc).
 * Includes bounce/shake effects that respect prefers-reduced-motion.
 * 
 * Example:
 * ```tsx
 * const { success, error } = useStateChangeAnimation();
 * 
 * {isSuccess && (
 *   <motion.div {...success}>
 *     <CheckCircle />
 *   </motion.div>
 * )}
 * ```
 */
export const useStateChangeAnimation = () => {
  const { shouldReduceMotion, spring } = useMotionPreferences();

  return {
    // Success state (bounce in with checkmark)
    success: {
      initial: { scale: 0.5, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: 0.4,
              type: 'spring' as const,
              bounce: 0.5,
            },
      },
      exit: { scale: 0.5, opacity: 0 },
    },

    // Error state (shake)
    error: {
      animate: shouldReduceMotion
        ? {}
        : {
            x: [0, -8, 8, -8, 8, 0],
            transition: {
              duration: 0.4,
              ease: 'easeInOut',
            },
          },
    },

    // Warning state (pulse)
    warning: {
      animate: shouldReduceMotion
        ? {}
        : {
            boxShadow: [
              '0 0 0 0 rgba(251, 191, 36, 0.7)',
              '0 0 0 20px rgba(251, 191, 36, 0)',
            ],
            transition: {
              duration: 1.5,
              repeat: Infinity,
            },
          },
    },

    // Info state (subtle pulse)
    info: {
      animate: shouldReduceMotion
        ? {}
        : {
            opacity: [0.8, 1, 0.8],
            transition: {
              duration: 2,
              repeat: Infinity,
            },
          },
    },
  };
};

// ============================================================================
// INTERACTION HOOKS
// ============================================================================

/**
 * useHoverAnimation
 * 
 * Get animation preset for hover states.
 * Respects prefers-reduced-motion and device capabilities.
 * 
 * Example:
 * ```tsx
 * const hover = useHoverAnimation();
 * 
 * <motion.button whileHover={hover.lift}>
 *   Click me
 * </motion.button>
 * ```
 */
export const useHoverAnimation = () => {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    // Lift effect (scale + translate up)
    lift: shouldReduceMotion
      ? {}
      : {
          y: -4,
          scale: 1.02,
          transition: { duration: 0.15 },
        },

    // Scale only
    scale: shouldReduceMotion
      ? {}
      : {
          scale: 1.05,
          transition: { duration: 0.15 },
        },

    // Glow effect (shadow)
    glow: shouldReduceMotion
      ? {}
      : {
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          transition: { duration: 0.15 },
        },
  };
};

/**
 * useTapAnimation
 * 
 * Get animation for button/interactive element tap/click.
 * Creates press-down effect that respects prefers-reduced-motion.
 * 
 * Example:
 * ```tsx
 * const tap = useTapAnimation();
 * 
 * <motion.button whileTap={tap.press}>
 *   Click me
 * </motion.button>
 * ```
 */
export const useTapAnimation = () => {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    // Press down effect
    press: shouldReduceMotion
      ? {}
      : {
          scale: 0.95,
          transition: { duration: 0.1 },
        },

    // Subtle press
    subtlePress: shouldReduceMotion
      ? {}
      : {
          scale: 0.98,
          transition: { duration: 0.08 },
        },
  };
};

// ============================================================================
// MODAL / DRAWER HOOKS
// ============================================================================

/**
 * useModalAnimation
 * 
 * Get standardized animations for modal/dialog entrance and exit.
 * Includes backdrop fade and content scaling.
 * 
 * Example:
 * ```tsx
 * const modal = useModalAnimation();
 * 
 * <motion.div {...modal.backdrop}>
 *   {/* Overlay */}
 * </motion.div>
 * <motion.div {...modal.content}>
 *   {/* Modal content */}
 * </motion.div>
 * ```
 */
export const useModalAnimation = () => {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    // Backdrop fade
    backdrop: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: shouldReduceMotion ? 0 : 0.15 },
      },
      exit: { opacity: 0 },
    },

    // Modal content (scale + fade)
    content: {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.3,
          ease: 'easeOut',
        },
      },
      exit: { opacity: 0, scale: 0.9, y: 10 },
    },
  };
};

/**
 * useDrawerAnimation
 * 
 * Get standardized animations for drawer/sidebar entrance.
 * Supports left, right, top, bottom directions.
 * 
 * Example:
 * ```tsx
 * const drawer = useDrawerAnimation('left');
 * 
 * <motion.div {...drawer.panel}>
 *   {/* Drawer content */}
 * </motion.div>
 * ```
 */
export const useDrawerAnimation = (direction: 'left' | 'right' | 'top' | 'bottom' = 'left') => {
  const { shouldReduceMotion, spring } = useMotionPreferences();

  const getInitialState = () => {
    if (shouldReduceMotion) return { opacity: 0 };
    switch (direction) {
      case 'left':
        return { x: -280, opacity: 0 };
      case 'right':
        return { x: 280, opacity: 0 };
      case 'top':
        return { y: -280, opacity: 0 };
      case 'bottom':
        return { y: 280, opacity: 0 };
    }
  };

  const getAnimateState = () => {
    if (shouldReduceMotion) return { opacity: 1 };
    switch (direction) {
      case 'left':
        return { x: 0, opacity: 1 };
      case 'right':
        return { x: 0, opacity: 1 };
      case 'top':
        return { y: 0, opacity: 1 };
      case 'bottom':
        return { y: 0, opacity: 1 };
    }
  };

  const getExitState = () => {
    if (shouldReduceMotion) return { opacity: 0 };
    switch (direction) {
      case 'left':
        return { x: -280, opacity: 0 };
      case 'right':
        return { x: 280, opacity: 0 };
      case 'top':
        return { y: -280, opacity: 0 };
      case 'bottom':
        return { y: 280, opacity: 0 };
    }
  };

  return {
    // Panel slide animation
    panel: {
      initial: getInitialState(),
      animate: getAnimateState(),
      exit: getExitState(),
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: 0.3,
            type: 'spring' as const,
            damping: 25,
            stiffness: 300,
          },
    },

    // Overlay fade
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: shouldReduceMotion ? 0 : 0.15 },
    },
  };
};

// ============================================================================
// PAGE TRANSITION HOOKS
// ============================================================================

/**
 * usePageTransition
 * 
 * Get animation for page navigation/route changes.
 * Keep transitions subtle for SaaS apps (not gaming UX).
 */
export const usePageTransition = () => {
  const { shouldReduceMotion } = useMotionPreferences();

  return {
    // Fade in/out (most common for SaaS)
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },

    // Slide in from right (optional for depth)
    slideIn: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  };
};

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export const hooks = {
  useMotionPreferences,
  useStaggerAnimation,
  useStaggerSlideAnimation,
  useLoadingAnimation,
  useStateChangeAnimation,
  useHoverAnimation,
  useTapAnimation,
  useModalAnimation,
  useDrawerAnimation,
  usePageTransition,
};

export default hooks;
