import type { Variants } from 'framer-motion';

const ANIMATION_CONSTANTS = {
  STAGGER_DELAY: 0.1,
  WIGGLE_AMOUNT_1: 5,
  WIGGLE_AMOUNT_2: 10,
  SCALE_AMOUNT: 1.1,
  OPACITY_AMOUNT: 0.8,
};

// Shared transitions
export const transitions = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 15,
  },
  smooth: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  },
  slowSpring: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
  },
} as const;

// Mobile navigation animations
export const mobileNavVariants = {
  icon: {
    active: {
      rotate: [
        0,
        -ANIMATION_CONSTANTS.WIGGLE_AMOUNT_2,
        ANIMATION_CONSTANTS.WIGGLE_AMOUNT_2,
        -ANIMATION_CONSTANTS.WIGGLE_AMOUNT_1,
        ANIMATION_CONSTANTS.WIGGLE_AMOUNT_1,
        0,
      ],
      scale: [1, ANIMATION_CONSTANTS.SCALE_AMOUNT, 1],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  } satisfies Variants,
  text: {
    active: {
      scale: 1.05,
      color: 'hsl(var(--primary))',
      transition: transitions.smooth,
    },
    inactive: {
      scale: 1,
      color: 'hsl(var(--muted-foreground))',
      transition: transitions.smooth,
    },
  } satisfies Variants,
} as const;

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// List item animations
// listItemVariants removed - unused

// Card animations
// cardVariants removed - unused

// Loading animations
// loadingVariants removed - unused

// Dialog/Modal animations
// dialogVariants removed - unused

// Expandable content animations
// expandableVariants removed - unused

// Hover effects
// hoverVariants removed - unused

// Notification animations
// notificationVariants removed - unused
