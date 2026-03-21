/**
 * AnimatedListItem Component (Phase 3)
 * 
 * List item with hover lift, selection animation, and swipe-out deletion.
 * Perfect for inbox, products, orders lists.
 * 
 * ✅ Hover scale/lift (transform only)
 * ✅ Selection checkbox spring animation
 * ✅ Swipe-out deletion (x transform)
 * ✅ 60 FPS smooth interactions
 * ✅ Respects prefers-reduced-motion
 * 
 * Usage:
 * <AnimatedListItem>Item content</AnimatedListItem>
 * <AnimatedListItem isSelected onDelete={() => handleDelete()}>Item</AnimatedListItem>
 */

'use client';

import React, { ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { useHoverAnimation, useMotionPreferences } from '@/lib/useMotionHooks';

interface AnimatedListItemProps {
  children: ReactNode;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  className?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  isSelected = false,
  onSelect,
  onDelete,
  isDeleting = false,
  className = '',
}) => {
  const { hover } = useHoverAnimation({ scale: 1.01, shadowLift: 2 });
  const { shouldReduceMotion } = useMotionPreferences();
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  const handleDelete = async () => {
    setIsDeletingLocal(true);
    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));
    onDelete?.();
  };

  return (
    <motion.div
      layout
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 100 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: 'easeOut',
      }}
      className={`
        flex items-center gap-3 p-4 rounded-lg
        border border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900
        transition-colors
        ${isSelected ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''}
        ${isDeletingLocal || isDeleting ? 'opacity-50' : ''}
        ${className}
      `}
      whileHover={!isDeletingLocal && !isDeleting ? hover : {}}
      whileTap={!isDeletingLocal && !isDeleting ? { scale: 0.99 } : {}}
    >
      {/* Checkbox - Spring animation */}
      {onSelect && (
        <motion.input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
          animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 300,
          }}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Delete Button */}
      {onDelete && (
        <motion.button
          onClick={handleDelete}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
          whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          disabled={isDeletingLocal || isDeleting}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};

AnimatedListItem.displayName = 'AnimatedListItem';

// ============================================================================
// LIST CONTAINER (Staggered entrance for list items)
// ============================================================================

interface AnimatedListProps {
  children: ReactNode;
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 0.05,
}) => {
  const { shouldReduceMotion } = useMotionPreferences();

  return (
    <motion.div
      className="space-y-3"
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
            hidden: { opacity: 0, y: 10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: shouldReduceMotion ? 0 : 0.2,
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

AnimatedList.displayName = 'AnimatedList';
