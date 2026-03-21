/**
 * AnimatedLoader Component (Phase 3)
 * 
 * Skeleton loaders with staggered fade-in animation.
 * Perfect for dashboard loading states.
 * 
 * ✅ Staggered children animation (smooth cascade)
 * ✅ Respects prefers-reduced-motion
 * ✅ 60 FPS smooth entrance
 * 
 * Usage:
 * <AnimatedLoader count={4} />
 * <AnimatedCardLoader /> (pre-built card shape)
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useStaggerAnimation } from '@/lib/useMotionHooks';

interface AnimatedLoaderProps {
  count?: number;
  height?: string;
  className?: string;
}

/**
 * Generic staggered loaders
 */
export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  count = 4,
  height = 'h-12',
  className = '',
}) => {
  const { containerVariants, itemVariants } = useStaggerAnimation({
    staggerDelay: 0.1,
    itemDuration: 0.4,
  });

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse`}
          variants={itemVariants}
        />
      ))}
    </motion.div>
  );
};

AnimatedLoader.displayName = 'AnimatedLoader';

// ============================================================================
// CARD LOADER (Pre-built shape for dashboard)
// ============================================================================

/**
 * Skeleton loader in card shape (perfect for dashboard metrics)
 */
export const AnimatedCardLoader: React.FC<{ count?: number }> = ({ count = 4 }) => {
  const { containerVariants, itemVariants } = useStaggerAnimation({
    staggerDelay: 0.05,
    itemDuration: 0.3,
  });

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          variants={itemVariants}
        >
          <div className="space-y-4">
            {/* Icon placeholder */}
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

            {/* Title placeholder */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />

            {/* Value placeholder */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />

            {/* Subtitle placeholder */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

AnimatedCardLoader.displayName = 'AnimatedCardLoader';

// ============================================================================
// SPINNER LOADER
// ============================================================================

/**
 * Spinning loader (1 second per rotation)
 */
export const AnimatedSpinner: React.FC<{ size?: string; className?: string }> = ({
  size = 'w-8 h-8',
  className = '',
}) => {
  const { shouldReduceMotion } = useStaggerAnimation();

  return (
    <motion.div
      className={`${size} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        type: 'tween',
        duration: shouldReduceMotion.shouldReduceMotion ? 0 : 1,
        ease: 'linear',
        repeat: Infinity,
      }}
    />
  );
};

AnimatedSpinner.displayName = 'AnimatedSpinner';
