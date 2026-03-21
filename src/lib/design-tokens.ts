/**
 * Design System Tokens
 * 
 * Centralized design tokens for consistent spacing, motion, colors, and responsive behavior.
 * Used throughout the design system to maintain visual and interaction consistency.
 */

// ============================================================================
// SPACING SYSTEM (8pt base grid)
// ============================================================================

export const spacing = {
  // Micro spacing
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '2.5rem', // 40px
  '4xl': '3rem',   // 48px
  '5xl': '4rem',   // 64px
} as const;

/**
 * Density levels for compact to spacious layouts
 * Use these to support different density preferences
 */
export const density = {
  // Maximum compression - small screens, power users
  compact: {
    paddingX: spacing.md,    // 12px
    paddingY: spacing.sm,    // 8px
    gap: spacing.sm,         // 8px
    radius: '0.375rem',      // 6px
  },
  // Default - balanced for most use cases
  normal: {
    paddingX: spacing.lg,    // 16px
    paddingY: spacing.md,    // 12px
    gap: spacing.md,         // 12px
    radius: spacing.md,      // 12px (0.75rem)
  },
  // Comfortable - larger touch targets, accessibility
  comfortable: {
    paddingX: spacing.xl,    // 24px
    paddingY: spacing.lg,    // 16px
    gap: spacing.lg,         // 16px
    radius: spacing.lg,      // 16px
  },
  // Spacious - maximum breathing room, large screens
  spacious: {
    paddingX: '1.5rem',      // 24px
    paddingY: spacing.xl,    // 24px
    gap: spacing.xl,         // 24px
    radius: spacing.xl,      // 24px
  },
} as const;

/**
 * Component-specific spacing patterns
 */
export const componentSpacing = {
  // Button spacing
  button: {
    // Padding by size
    sm: { paddingX: spacing.md, paddingY: spacing.xs },     // 12px x 4px
    md: { paddingX: spacing.lg, paddingY: spacing.sm },     // 16px x 8px
    lg: { paddingX: spacing.xl, paddingY: spacing.md },     // 24px x 12px
    // Icon button (square)
    icon: { padding: spacing.lg },  // 16px all
    // Gap between icon and text
    iconGap: spacing.sm,            // 8px
  },

  // Input spacing
  input: {
    paddingX: spacing.lg,           // 16px
    paddingY: spacing.md,           // 12px
    height: '2.25rem',              // 36px
  },

  // Card spacing
  card: {
    paddingX: spacing.xl,           // 24px
    paddingY: spacing.xl,           // 24px
    gap: spacing.lg,                // 16px (between children)
  },

  // Form spacing
  form: {
    spacing: spacing.xl,            // 24px between fields
    labelMargin: spacing.sm,        // 8px between label and input
  },

  // List/Table spacing
  list: {
    rowHeight: '2.75rem',           // 44px
    paddingX: spacing.lg,           // 16px
    paddingY: spacing.md,           // 12px
  },

  // Modal/Dialog
  modal: {
    paddingX: spacing.xl,           // 24px
    paddingY: spacing.xl,           // 24px
    closeButtonSize: '2.5rem',      // 40px
  },

  // Sidebar
  sidebar: {
    itemHeight: '2.75rem',          // 44px
    itemPaddingX: spacing.lg,       // 16px
    itemPaddingY: spacing.md,       // 12px
    paddingTop: spacing.xl,         // 24px
    paddingBottom: spacing.xl,      // 24px
  },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 320,    // Small phones (min guaranteed mobile width)
  sm: 480,    // Large phones
  md: 768,    // Tablets (iPad mini)
  lg: 1024,   // Desktops (iPad Pro landscape)
  xl: 1280,   // Large desktops
  '2xl': 1536, // Extra-large displays
} as const;

/**
 * Media query helpers (as strings for Tailwind/CSS)
 */
export const mediaQueries = {
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  wide: '@media (min-width: 1280px)',
} as const;

/**
 * Responsive container widths
 */
export const containerWidths = {
  sm: '100%',      // Full width on mobile
  md: '720px',     // Tablets
  lg: '960px',     // Desktops
  xl: '1140px',    // Large desktops
  '2xl': '1320px', // Extra-large
} as const;

// ============================================================================
// MOTION & ANIMATION TOKENS
// ============================================================================

export const motion = {
  // Durations
  durations: {
    micro: '100ms',   // Micro-interactions (100ms)
    fast: '150ms',    // Fast transitions (150ms)
    normal: '200ms',  // Standard transitions (200ms)
    slow: '300ms',    // Slow transitions (300ms)
    xslow: '400ms',   // Very slow transitions (400ms)
    loading: '2s',    // Loading spinner (2s)
    pageTransition: '250ms', // Page route change
  },

  // Easing curves
  easings: {
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',        // Sharp timing
    ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Standard ease
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',         // Ease in
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',        // Ease out
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',    // Ease in-out
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Spring (bouncy)
  },

  // Spring physics
  spring: {
    soft: { damping: 20, stiffness: 100, mass: 1 },
    gentle: { damping: 25, stiffness: 200, mass: 1 },
    normal: { damping: 25, stiffness: 300, mass: 1 },
    lively: { damping: 20, stiffness: 400, mass: 1 },
  },
} as const;

/**
 * Common animation transition presets
 */
export const transitions = {
  // Micro-interactions (100ms)
  microInteraction: {
    duration: '100ms',
    easing: 'cubic-bezier(0, 0, 0.2, 1)', // easeOut
  },

  // Standard transition (200ms)
  standard: {
    duration: '200ms',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // ease
  },

  // Slow transition (300ms)
  slow: {
    duration: '300ms',
    easing: 'cubic-bezier(0, 0, 0.2, 1)', // easeOut
  },

  // Fast transition (150ms)
  fast: {
    duration: '150ms',
    easing: 'cubic-bezier(0, 0, 0.2, 1)', // easeOut
  },

  // Very slow entrance (400ms)
  entrance: {
    duration: '400ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // spring
  },

  // Quick exit (100ms)
  exit: {
    duration: '100ms',
    easing: 'cubic-bezier(0.4, 0, 1, 1)', // easeIn
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font families
  families: {
    sans: 'system-ui, -apple-system, sans-serif',
    mono: 'Menlo, Courier, monospace',
  },

  // Font sizes
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

// ============================================================================
// COLOR PALETTE STRUCTURE
// ============================================================================

export const colors = {
  // Semantic color names (actual values come from theme.css)
  semantic: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    destructive: 'var(--destructive)',
    destructiveForeground: 'var(--destructive-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
  },

  // Sidebar colors
  sidebar: {
    background: 'var(--sidebar)',
    foreground: 'var(--sidebar-foreground)',
    primary: 'var(--sidebar-primary)',
    primaryForeground: 'var(--sidebar-primary-foreground)',
    accent: 'var(--sidebar-accent)',
    accentForeground: 'var(--sidebar-accent-foreground)',
    border: 'var(--sidebar-border)',
  },

  // Chart colors (for data visualization)
  chart: {
    1: 'var(--chart-1)',
    2: 'var(--chart-2)',
    3: 'var(--chart-3)',
    4: 'var(--chart-4)',
    5: 'var(--chart-5)',
  },
} as const;

// ============================================================================
// BORDER & RADIUS SYSTEM
// ============================================================================

export const borders = {
  // Border radius
  radius: {
    none: '0',
    sm: '0.375rem',    // 6px
    md: '0.625rem',    // 10px (default)
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.25rem',  // 20px
    full: '9999px',    // Fully rounded
  },

  // Border widths
  widths: {
    none: '0px',
    thin: '1px',
    default: '1px',
    thick: '2px',
  },
} as const;

/**
 * Shadow system (elevation levels)
 */
export const shadows = {
  none: 'box-shadow: none',
  sm: 'box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': 'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ============================================================================
// SIZE SYSTEM
// ============================================================================

export const sizes = {
  // Common component sizes
  button: {
    sm: '2rem',      // 32px height
    md: '2.5rem',    // 40px height
    lg: '2.75rem',   // 44px height
    icon: '2rem',    // 32px square
  },

  input: {
    sm: '2rem',      // 32px height
    md: '2.5rem',    // 40px height
    lg: '2.75rem',   // 44px height
  },

  // Modal/Dialog sizes
  modal: {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    fullscreen: '100vw',
  },

  // Sidebar width
  sidebar: {
    collapsed: '60px',
    normal: '280px',
    wide: '320px',
  },

  // Icon sizes
  icon: {
    xs: '1rem',      // 16px
    sm: '1.25rem',   // 20px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '2.5rem',    // 40px
  },
} as const;

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  
  // Dropdowns, tooltips
  dropdown: 1000,
  
  // Sticky elements
  sticky: 900,
  
  // Modals, dialogs
  modal: 1040,
  
  // Modal backdrops
  backdrop: 1030,
  
  // Notifications, toasts
  notification: 1050,
  
  // Popovers
  popover: 1060,
  
  // Tooltips
  tooltip: 1070,
} as const;

// ============================================================================
// TRANSITIONS (CSS-ready)
// ============================================================================

export const cssTransitions = {
  // Property: duration   timing-function    delay
  fast: 'all 100ms cubic-bezier(0, 0, 0.2, 1)',
  normal: 'all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  slow: 'all 300ms cubic-bezier(0, 0, 0.2, 1)',
  
  // Specific property transitions
  colors: 'color 200ms ease, background-color 200ms ease, border-color 200ms ease',
  transform: 'transform 200ms ease',
  opacity: 'opacity 200ms ease',
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const accessibility = {
  // Focus states
  focusRing: 'var(--ring)',
  focusRingWidth: '3px',
  focusRingOffset: '2px',

  // High contrast mode
  highContrastBorder: '2px solid',

  // Reduced motion
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export const designTokens = {
  spacing,
  density,
  componentSpacing,
  breakpoints,
  mediaQueries,
  containerWidths,
  motion,
  transitions,
  typography,
  colors,
  borders,
  shadows,
  sizes,
  zIndex,
  cssTransitions,
  accessibility,
} as const;

export default designTokens;
