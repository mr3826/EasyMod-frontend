/**
 * Animation Configuration
 * 
 * Centralized configuration for motion durations, easing, and animation patterns.
 * All values respect the 60 FPS constraint (16.67ms per frame).
 * 
 * ✅ Uses requestAnimationFrame internally (Motion library handles)
 * ✅ Targets transform + opacity only (GPU-accelerated)
 * ✅ will-change management built into component level
 */

export const MOTION_CONFIG = {
  // ============================================================================
  // DURATION TOKENS (milliseconds)
  // ============================================================================
  duration: {
    // Instant feedback (micro-interactions)
    instant: 0,
    
    // Fast: button hovers, icon toggles (100ms = 6 frames @ 60 FPS)
    fast: 100,
    
    // Default: standard transitions, modal opens (200ms = 12 frames @ 60 FPS)
    default: 200,
    
    // Slow: entrance animations, staggered sequences (300ms = 18 frames @ 60 FPS)
    slow: 300,
    
    // Extra slow: choreographed sequences (400ms = 24 frames @ 60 FPS)
    xslow: 400,
  },

  // ============================================================================
  // EASING CURVES (cubic-bezier)
  // ============================================================================
  easing: {
    // Sharp timing for precise events
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    
    // Standard easing for most animations
    ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Ease-in: acceleration from zero velocity
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    
    // Ease-out: deceleration to zero velocity
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    
    // Ease-in-out: acceleration then deceleration
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Bouncy entrance with overshoot
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // Linear (for continuous rotations, progress bars)
    linear: 'linear',
  },

  // ============================================================================
  // PRESET ANIMATION TRANSITIONS
  // ============================================================================
  transitions: {
    // Micro-interaction (button press, icon hove)
    microInteraction: {
      duration: 0.1,
      ease: 'easeOut',
    },

    // Standard transition (panel open, filter apply)
    standard: {
      duration: 0.2,
      ease: 'easeOut',
    },

    // Slow transition (page load, major state change)
    slow: {
      duration: 0.3,
      ease: 'easeOut',
    },

    // Entrance animation (choreographed sequences)
    entrance: {
      duration: 0.3,
      ease: 'spring',
    },

    // Exit animation (dismissal)
    exit: {
      duration: 0.15,
      ease: 'easeIn',
    },

    // Spring-based natural bounce
    spring: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      bounce: 0.3,
    },
  },

  // ============================================================================
  // ANIMATION VARIANTS (Reusable Motion Patterns)
  // ============================================================================
  variants: {
    // Fade in/out
    fadeInOut: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // Scale up with fade (modal entrance)
    scaleInOut: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },

    // Slide from left (sidebar)
    slideInLeft: {
      initial: { x: -280, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -280, opacity: 0 },
    },

    // Slide from right (approval swipe-out)
    slideOutRight: {
      exit: { x: 100, opacity: 0 },
    },

    // Slide from top (alerts)
    slideInDown: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
    },

    // Staggered list entrance
    staggerContainer: {
      initial: 'hidden',
      animate: 'visible',
      variants: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0,
          },
        },
      },
    },

    staggerItem: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    },
  },

  // ============================================================================
  // PERFORMANCE CONSTRAINTS
  // ============================================================================
  performance: {
    // 60 FPS = 16.67ms per frame budget
    frameTimeMs: 16.67,
    
    // Maximum animation duration (moderator impatience)
    maxDurationMs: 500,
    
    // Only animate transform + opacity (NO layout properties)
    allowedProperties: ['transform', 'opacity', 'scale', 'x', 'y', 'rotate'],
    
    // will-change management (applied selectively, not globally)
    gpu: {
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
    },
  },

  // ============================================================================
  // ACCESSIBILITY
  // ============================================================================
  accessibility: {
    // Respect prefers-reduced-motion media query
    reduceMotionDuration: 0,
    
    // Disable spring bounce for motion-sensitive users
    reduceMotionType: 'tween',
    
    // Disable complex spring physics
    reduceMotionDamping: 20,
    reduceMotionStiffness: 0,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get transition config by name
 * Usage: getTransition('standard') → { duration: 0.2, ease: 'easeOut' }
 */
export function getTransition(key: keyof typeof MOTION_CONFIG.transitions) {
  return MOTION_CONFIG.transitions[key];
}

/**
 * Get variant config by name
 * Usage: getVariant('scaleInOut') → { initial, animate, exit }
 */
export function getVariant(key: keyof typeof MOTION_CONFIG.variants) {
  return MOTION_CONFIG.variants[key];
}

/**
 * Calculate stagger delay for N items
 * Usage: calculateStaggerDelay(5) → 0.05 for smooth cascading
 */
export function calculateStaggerDelay(itemCount: number): number {
  const targetTotalDuration = 300; // total stagger duration in ms
  const delayPerItem = targetTotalDuration / itemCount / 1000; // convert to seconds
  return Math.max(delayPerItem, 0.05); // minimum 50ms per item
}
