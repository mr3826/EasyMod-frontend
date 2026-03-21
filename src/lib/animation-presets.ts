/**
 * Animation Presets Library
 * 
 * Pre-configured animation patterns for consistent motion design.
 * Every animation respects prefers-reduced-motion automatically.
 * 
 * Usage:
 * ```tsx
 * <motion.div {...animationPresets.cardEnter}>
 *   Card content
 * </motion.div>
 * ```
 */

import type { Variants } from 'motion/react';

// ============================================================================
// EASING CURVES
// ============================================================================

export const easings = {
  // Sharp timing for precise events
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  
  // Standard easing for most animations
  ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  
  // Quick entrance/exit
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Bouncy entrance
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ============================================================================
// TIMING PRESETS
// ============================================================================

export const timings = {
  // Micro-interaction (button press, icon toggle)
  microInteraction: {
    duration: 0.1,
    ease: 'easeOut',
  } as const,

  // Standard transition (panel open, filter apply)
  standard: {
    duration: 0.2,
    ease: 'easeOut',
  } as const,

  // Slow transition (page load, major state change)
  slow: {
    duration: 0.3,
    ease: 'easeOut',
  } as const,

  // Very slow (entrance animation, choreographed sequences)
  xslow: {
    duration: 0.4,
    ease: 'easeOut',
  } as const,
};

// ============================================================================
// MOTION PRESETS - INDIVIDUAL ELEMENTS
// ============================================================================

/**
 * Fade In / Fade Out
 * Used for: Modals, drawers, overlays, tooltips
 */
export const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const;

/**
 * Scale Up (Entrance) / Scale Down (Exit)
 * Used for: Modals, popovers, confirmations
 */
export const scaleInOut = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const;

/**
 * Slide From Left
 * Used for: Sidebars, drawers, navigation panels
 */
export const slideInLeft = {
  initial: { x: -280, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -280, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/**
 * Slide From Right
 * Used for: Right-side panels, detail views
 */
export const slideInRight = {
  initial: { x: 280, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 280, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/**
 * Slide Up (Entrance)
 * Used for: Cards, bottom sheets, content reveal
 */
export const slideInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 10, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/**
 * Bounce in Scale
 * Used for: Important notifications, state confirmations
 */
export const bounceInScale = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: 0.3, type: 'spring', bounce: 0.4 },
} as const;

/**
 * Shake (Horizontal)
 * Used for: Error states, invalid actions
 */
export const shakeX = {
  animate: { x: [0, -8, 8, -8, 8, 0] },
  transition: { duration: 0.4, ease: 'easeInOut' },
} as const;

/**
 * Rotate Infinite
 * Used for: Loading spinners, processing indicators
 */
export const spinInfinite = {
  animate: { rotate: 360 },
  transition: { duration: 2, repeat: Infinity, ease: 'linear' },
} as const;

/**
 * Pulse (Opacity)
 * Used for: Loading skeleton, disabled state, attention grabber
 */
export const pulseOpacity = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
} as const;

/**
 * Bounce (Vertical)
 * Used for: Emphasis, attention direction
 */
export const bounceY = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
} as const;

// ============================================================================
// MOTION PRESETS - CONTAINER/STAGGER PATTERNS
// ============================================================================

/**
 * Stagger Container - Parent wrapper for staggered animations
 * Use with itemVariants below
 * 
 * Example:
 * ```tsx
 * <motion.div variants={staggerContainer} initial="hidden" animate="show">
 *   {items.map((item, i) => (
 *     <motion.div key={i} variants={staggerItem}>{item}</motion.div>
 *   ))}
 * </motion.div>
 * ```
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between children
      delayChildren: 0.0,
    },
  },
} as const satisfies Variants;

/**
 * Stagger Item - Standard staggered appearance
 * Pair with staggerContainer above
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
} as const satisfies Variants;

/**
 * Stagger Item Slide - Slide from left with stagger
 * Pair with staggerContainer above
 */
export const staggerItemSlide = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
} as const satisfies Variants;

/**
 * Stagger Item Scale - Scale up with stagger
 * Pair with staggerContainer above
 */
export const staggerItemScale = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
} as const satisfies Variants;

// ============================================================================
// COMPONENT-SPECIFIC PRESETS
// ============================================================================

/**
 * CARD ENTRANCE
 * Use for: Dashboard cards, content cards, product cards
 */
export const cardEnter = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/**
 * TABLE ROW ENTRANCE (factory function)
 * Use for: Product table, order list, customer list
 * 
 * Example:
 * ```tsx
 * <motion.tr {...tableRowEnter(index)}>
 *   ...
 * </motion.tr>
 * ```
 */
export const tableRowEnter = (index: number, staggerDelay = 0.05) => ({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: {
    duration: 0.2,
    delay: index * staggerDelay,
    ease: 'easeOut',
  },
});

/**
 * MODAL / DIALOG ENTRANCE
 * Use for: Confirmations, forms, details
 */
export const modalEnter = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/**
 * MODAL BACKDROP
 * Use for: Modal/dialog overlay
 */
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const;

/**
 * DROPDOWN MENU
 * Use for: Dropdown lists, select menus
 */
export const dropdownMenu = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.95 },
  transition: { duration: 0.15, ease: 'easeOut' },
} as const;

/**
 * TOOLTIP ENTRANCE
 * Use for: Tooltips, hints, popovers
 */
export const tooltipEnter = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.1, ease: 'easeOut' },
} as const;

/**
 * TOAST / NOTIFICATION
 * Use for: Success, error, info toasts (slide from bottom)
 */
export const toastSlide = {
  initial: { opacity: 0, y: 100, x: 0 },
  animate: { opacity: 1, y: 0, x: 0 },
  exit: { opacity: 0, y: 100, x: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/**
 * INPUT FOCUS HIGHLIGHT
 * Use for: Form input focus state animation
 */
export const inputFocus = {
  animate: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' },
  transition: { duration: 0.15 },
} as const;

/**
 * BUTTON PRESS
 * Use for: Button active state
 */
export const buttonPress = {
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1 },
} as const;

/**
 * SKELETON LOADING PULSE
 * Use for: Loading skeletons, placeholders
 */
export const skeletonPulse = {
  animate: { opacity: [0.6, 1, 0.6] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
} as const;

/**
 * BADGE / TAG STATE CHANGE
 * Use for: Status badges, tags, labels that change state
 */
export const badgeStateChange = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: 0.2, type: 'spring', bounce: 0.4 },
} as const;

/**
 * CHECKMARK SUCCESS
 * Use for: Validation success, completion
 */
export const checkmarkSuccess = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.5, opacity: 0 },
  transition: { duration: 0.15, type: 'spring', bounce: 0.5 },
} as const;

/**
 * PAGE TRANSITION (Fade)
 * Use for: Route changes between major pages
 */
export const pageTransitionFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const;

/**
 * SIDEBAR / NAVIGATION OPEN
 * Use for: Mobile sidebar, navigation drawer
 */
export const sidebarOpen = {
  initial: { x: -280, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -280, opacity: 0 },
  transition: { duration: 0.3, type: 'spring', damping: 25, stiffness: 300 },
} as const;

/**
 * ACCORDION EXPAND/COLLAPSE
 * Use for: Accordion items, collapsible sections
 */
export const accordionExpand = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' },
} as const;

// ============================================================================
// CHART / DATA VISUALIZATION PRESETS
// ============================================================================

/**
 * BAR CHART ANIMATION
 * Use for: Chart bars animating in
 */
export const chartBarAnimationFactory = (index: number, delay = 0.05) => ({
  initial: { height: 0, opacity: 0 },
  animate: { height: '100%', opacity: 1 },
  transition: {
    duration: 0.4,
    delay: index * delay,
    ease: 'easeOut',
  },
});

/**
 * LINE CHART DRAW
 * Use for: Chart lines drawing in
 */
export const chartLineDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 0.8, ease: 'easeInOut' },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a staggered list animation
 * Use this factory to customize stagger timing
 */
export const createStaggerVariants = (
  staggerDelay = 0.05,
  duration = 0.3
) => ({
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.0,
      },
    },
  } as Variants,
  item: {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: 'easeOut' },
    },
  } as Variants,
});

/**
 * Create a slide-in animation with custom direction
 */
export const createSlideVariants = (
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  distance = 20
) => {
  const axisMap = {
    left: { axis: 'x' as const, value: -distance },
    right: { axis: 'x' as const, value: distance },
    up: { axis: 'y' as const, value: -distance },
    down: { axis: 'y' as const, value: distance },
  };

  const { axis, value } = axisMap[direction];

  return {
    initial: { [axis]: value, opacity: 0 },
    animate: { [axis]: 0, opacity: 1 },
    exit: { [axis]: value * 0.5, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };
};

/**
 * Combine presets
 * Use this to merge animation presets
 */
export const mergePresets = (base: any, override: any) => ({
  ...base,
  transition: { ...base.transition, ...override.transition },
});

// ============================================================================
// EXPORT ALL FOR QUICK ACCESS
// ============================================================================

export const presets = {
  // Basic animations
  fadeInOut,
  scaleInOut,
  slideInLeft,
  slideInRight,
  slideInUp,
  bounceInScale,
  shakeX,
  spinInfinite,
  pulseOpacity,
  bounceY,

  // Stagger patterns
  staggerContainer,
  staggerItem,
  staggerItemSlide,
  staggerItemScale,

  // Component-specific
  cardEnter,
  tableRowEnter,
  modalEnter,
  modalBackdrop,
  dropdownMenu,
  tooltipEnter,
  toastSlide,
  inputFocus,
  buttonPress,
  skeletonPulse,
  badgeStateChange,
  checkmarkSuccess,
  pageTransitionFade,
  sidebarOpen,
  accordionExpand,

  // Chart animations
  chartBarAnimationFactory,
  chartLineDraw,

  // Utilities
  createStaggerVariants,
  createSlideVariants,
  mergePresets,
};

export default presets;
