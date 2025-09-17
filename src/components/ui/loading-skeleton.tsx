'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

import { transitions } from '@/lib/utils/animations';

type LoadingSkeletonProps = {
  className?: string;
  count?: number;
  animation?: 'pulse' | 'wave';
  duration?: number;
};

const SKELETON_CONFIG = {
  OPACITY_FROM: 0.5,
  OPACITY_TO: 0.3,
  DURATION: 2,
  REPEAT: Number.POSITIVE_INFINITY,
  ITEM_DELAY: 0.1,
} as const;

export const LoadingSkeleton = memo(
  ({
    className = 'h-4 w-full rounded bg-muted/50',
    count = 1,
    animation = 'pulse',
    duration = SKELETON_CONFIG.DURATION,
  }: LoadingSkeletonProps) => {
    if (animation === 'pulse') {
      return (
        <div className="space-y-2">
          {Array.from({ length: count }, (_, i) => (
            <motion.div
              animate={{
                opacity: [
                  SKELETON_CONFIG.OPACITY_FROM,
                  SKELETON_CONFIG.OPACITY_TO,
                  SKELETON_CONFIG.OPACITY_FROM,
                ],
              }}
              className={className}
              key={`skeleton-${i}-${Math.random()}`}
              transition={{
                duration,
                repeat: SKELETON_CONFIG.REPEAT,
                delay: i * SKELETON_CONFIG.ITEM_DELAY,
              }}
            />
          ))}
        </div>
      );
    }

    // Wave animation
    return (
      <div className="space-y-2">
        {Array.from({ length: count }, (_, i) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className={className}
            initial={{ opacity: 0, x: -20 }}
            key={`skeleton-${i}-${Math.random()}`}
            transition={{
              delay: i * SKELETON_CONFIG.ITEM_DELAY,
              ...transitions.smooth,
            }}
          />
        ))}
      </div>
    );
  }
);

LoadingSkeleton.displayName = 'LoadingSkeleton';
