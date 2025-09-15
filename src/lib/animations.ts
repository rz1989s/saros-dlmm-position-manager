import { Variants, Transition } from 'framer-motion'

// Base animation configurations
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8
}

export const SPRING_CONFIG = {
  default: {
    type: 'spring',
    damping: 25,
    stiffness: 120,
    mass: 0.8
  },
  gentle: {
    type: 'spring',
    damping: 30,
    stiffness: 100,
    mass: 1
  },
  bouncy: {
    type: 'spring',
    damping: 15,
    stiffness: 200,
    mass: 0.5
  },
  snappy: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
    mass: 0.5
  }
} as const

// Core animation variants
export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.default
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 50
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.default
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRING_CONFIG.gentle
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const scaleInBounce: Variants = {
  initial: {
    opacity: 0,
    scale: 0.3
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRING_CONFIG.bouncy
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

// Container animations for staggered children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
}

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

// Button and interactive element animations
export const buttonTap: Variants = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut'
    }
  },
  hover: {
    scale: 1.02,
    transition: SPRING_CONFIG.snappy
  }
}

export const buttonPress: Variants = {
  tap: {
    scale: 0.98,
    y: 1,
    transition: {
      duration: 0.1,
      ease: 'easeInOut'
    }
  },
  hover: {
    y: -1,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: SPRING_CONFIG.snappy
  }
}

export const cardHover: Variants = {
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: SPRING_CONFIG.gentle
  }
}

export const cardTap: Variants = {
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: 'easeInOut'
    }
  }
}

// Number and counter animations
export const numberChange: Variants = {
  initial: {
    scale: 1,
    color: 'inherit'
  },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
      ease: 'easeInOut'
    }
  }
}

export const priceChange: Variants = {
  positive: {
    color: '#16a34a', // green-600
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.5, 1],
      ease: 'easeInOut'
    }
  },
  negative: {
    color: '#dc2626', // red-600
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.5, 1],
      ease: 'easeInOut'
    }
  }
}

// Modal and overlay animations
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_CONFIG.gentle
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

export const slideUpModal: Variants = {
  initial: {
    opacity: 0,
    y: '100%'
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING_CONFIG.default
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeIn'
    }
  }
}

// Loading and progress animations
export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export const progressBar: Variants = {
  initial: {
    scaleX: 0,
    originX: 0
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: 'easeOut'
    }
  }
}

// Page transition animations
export const pageSlideLeft: Variants = {
  initial: {
    opacity: 0,
    x: 100
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeIn'
    }
  }
}

export const pageSlideRight: Variants = {
  initial: {
    opacity: 0,
    x: -100
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeIn'
    }
  }
}

export const pageFade: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: 'easeIn'
    }
  }
}

// Chart and data visualization animations
export const chartBar: Variants = {
  initial: {
    scaleY: 0,
    originY: 1
  },
  animate: {
    scaleY: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: 'easeOut'
    }
  }
}

export const chartLine: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.slower,
      ease: 'easeInOut'
    }
  }
}

// Utility functions for creating custom animations
export const createStaggeredAnimation = (
  childVariant: Variants,
  staggerDelay: number = 0.1
): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: staggerDelay
    }
  }
})

export const createDelayedAnimation = (
  baseVariant: Variants,
  delay: number
): Variants => ({
  ...baseVariant,
  animate: {
    ...baseVariant.animate
  }
})

export const createCustomSpring = (
  damping: number,
  stiffness: number,
  mass: number = 1
): Transition => ({
  type: 'spring',
  damping,
  stiffness,
  mass
})

// Preset animation combinations for common UI patterns
export const PRESET_ANIMATIONS = {
  // Card entrance
  cardEnter: fadeInUp,

  // Button interactions
  buttonInteraction: buttonTap,

  // Modal presentation
  modalEnter: modalContent,
  modalBackdropEnter: modalBackdrop,

  // List items
  listItem: fadeInUp,
  listContainer: staggerContainer,

  // Page transitions
  pageTransition: pageFade,

  // Loading states
  loading: pulse,
  spinner: spin,

  // Data updates
  dataUpdate: numberChange,
  priceUpdate: priceChange
} as const

export type PresetAnimationType = keyof typeof PRESET_ANIMATIONS