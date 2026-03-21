/**
 * AnimatedCard Component
 * 
 * Modernized card with hover elevation, shadows, and smooth interactions.
 * 
 * ✅ Uses transform + opacity only (GPU-accelerated)
 * ✅ Hover lift via y transform (-4px = subtle elevation)
 * ✅ Shadow elevation system (sm/md/lg)
 * ✅ 60 FPS smooth hover state
 * ✅ Respects prefers-reduced-motion
 * 
 * Performance Notes:
 * - Hover lift: -4px y transform (not height change!)
 * - Shadow: static, doesn't animate (can't reach 60 FPS)
 * - Duration: 150-200ms (responsive feel)
 */

'use client';

import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useHoverAnimation, useMotionPreferences } from '@/lib/useMotionHooks';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  isClickable?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

const shadowStyles = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  none: 'shadow-none',
};

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      children,
      elevation = 'md',
      isClickable = false,
      onClick,
      isLoading = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const { hover } = useHoverAnimation({ scale: 1.02, shadowLift: 4 });
    const { shouldReduceMotion } = useMotionPreferences();

    return (
      <motion.div
        ref={ref}
        className={`
          bg-white dark:bg-gray-900
          rounded-lg border border-gray-200 dark:border-gray-800
          p-6 transition-colors
          ${shadowStyles[elevation]}
          ${isClickable ? 'cursor-pointer' : ''}
          ${isLoading ? 'opacity-60' : ''}
          ${className}
        `}
        // Hover lift: move up by 4px (y transform, not layout change = GPU-accelerated)
        whileHover={isClickable && !isLoading ? hover : {}}
        // Tap feedback
        whileTap={isClickable && !isLoading ? { scale: 0.98 } : {}}
        // Maintain state during loading
        animate={
          isLoading
            ? { opacity: 0.6 }
            : { opacity: 1 }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.15,
          ease: 'easeOut',
        }}
        onClick={isClickable ? onClick : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// ============================================================================
// CARD GROUP (Staggered entrance for multiple cards)
// ============================================================================

interface AnimatedCardGroupProps {
  children: ReactNode;
  staggerDelay?: number;
}

export const AnimatedCardGroup: React.FC<AnimatedCardGroupProps> = ({
  children,
  staggerDelay = 0.05,
}) => {
  const { shouldReduceMotion } = useMotionPreferences();

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
            delayChildren: 0,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: shouldReduceMotion ? 0 : 0.3,
                ease: 'easeOut',
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

AnimatedCardGroup.displayName = 'AnimatedCardGroup';
