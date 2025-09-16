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
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * ANIMATION_CONSTANTS.STAGGER_DELAY,
      ...transitions.smooth,
    },
  }),
  exit: { opacity: 0, y: -20 },
};

// Card animations
export const cardVariants: Variants = {
  hover: {
    y: -4,
    transition: transitions.spring,
  },
  tap: { scale: 0.98 },
};

// Loading animations
export const loadingVariants = {
  icon: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1, ANIMATION_CONSTANTS.SCALE_AMOUNT, 1],
      opacity: [1, ANIMATION_CONSTANTS.OPACITY_AMOUNT, 1],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'reverse',
      },
    },
  } satisfies Variants,
  bar: {
    initial: { width: 0 },
    animate: {
      width: '100%',
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  } satisfies Variants,
  progress: {
    initial: { x: '-100%' },
    animate: {
      x: '100%',
      transition: {
        duration: 1,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      },
    },
  } satisfies Variants,
} as const;

// Dialog/Modal animations
export const dialogVariants = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
      },
    },
  },
} as const;

// Expandable content animations
export const expandableVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  },
} as const;

// Hover effects
export const hoverVariants = {
  subtle: {
    scale: 1.02,
    transition: transitions.spring,
  },
  lift: {
    y: -4,
    transition: transitions.spring,
  },
  glow: {
    boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.5)',
    transition: transitions.smooth,
  },
} as const;

// Notification animations
export const notificationVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
} as const;
