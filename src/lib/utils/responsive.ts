// Responsive utility functions and configurations for consistent mobile-first design

/**
 * Standard Tailwind CSS breakpoints used throughout the application
 * These match Tailwind's default breakpoints for consistency
 */
export const breakpoints = {
  sm: '640px',   // Small devices (phones, 640px and up)
  md: '768px',   // Medium devices (tablets, 768px and up) 
  lg: '1024px',  // Large devices (desktops, 1024px and up)
  xl: '1280px',  // Extra large devices (large desktops, 1280px and up)
  '2xl': '1536px' // 2X Large devices (larger desktops, 1536px and up)
} as const

/**
 * Common responsive spacing patterns
 */
export const responsiveSpacing = {
  // Container padding: mobile-first approach
  container: 'px-4 sm:px-6 lg:px-8',
  
  // Page padding
  page: 'py-4 sm:py-6 lg:py-8',
  
  // Section spacing
  section: 'space-y-6 sm:space-y-8',
  
  // Card spacing
  card: 'space-y-3 sm:space-y-4',
  
  // Grid gaps
  gridGap: 'gap-3 sm:gap-4 lg:gap-6',
  
  // Flex gaps
  flexGap: 'gap-2 sm:gap-3 lg:gap-4'
} as const

/**
 * Common responsive grid patterns
 */
export const responsiveGrids = {
  // 1 column on mobile, 2 on tablet, 3 on desktop
  grid123: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  
  // 1 column on mobile, 2 on tablet, 4 on desktop  
  grid124: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  
  // 1 column on mobile, 3 on desktop
  grid13: 'grid-cols-1 lg:grid-cols-3',
  
  // 2 columns on all sizes except mobile (1 column)
  grid12: 'grid-cols-1 sm:grid-cols-2',
  
  // Metrics grid: 1 col mobile, 2 col tablet, 4 col desktop
  metrics: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  
  // Charts grid: 1 col mobile, 2 col desktop
  charts: 'grid-cols-1 xl:grid-cols-2'
} as const

/**
 * Common responsive text sizing
 */
export const responsiveText = {
  // Headings
  h1: 'text-2xl sm:text-3xl lg:text-4xl',
  h2: 'text-xl sm:text-2xl lg:text-3xl', 
  h3: 'text-lg sm:text-xl lg:text-2xl',
  h4: 'text-base sm:text-lg',
  
  // Body text
  body: 'text-sm sm:text-base',
  bodyLarge: 'text-base sm:text-lg',
  small: 'text-xs sm:text-sm',
  
  // Display text
  display: 'text-lg sm:text-xl font-bold',
  metric: 'text-base sm:text-lg font-semibold'
} as const

/**
 * Common responsive component sizing
 */
export const responsiveComponents = {
  // Button sizing
  button: 'h-8 w-8 sm:h-9 sm:w-auto sm:px-3',
  iconButton: 'h-8 w-8 sm:h-9 sm:w-9 p-0',
  
  // Modal sizing  
  modal: 'max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-4',
  modalLarge: 'max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-4',
  
  // Card header
  cardHeader: 'pb-3 sm:pb-4',
  
  // Input sizing
  input: 'text-sm sm:text-base px-3 py-2',
  
  // Icon sizing
  icon: 'h-3 w-3 sm:h-4 sm:w-4',
  iconLarge: 'h-4 w-4 sm:h-5 sm:w-5'
} as const

/**
 * Common responsive layout patterns
 */
export const responsiveLayouts = {
  // Flex layouts
  headerLayout: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4',
  centeredLayout: 'flex flex-col items-center justify-center',
  
  // Dashboard layouts
  dashboardContainer: 'container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8',
  
  // Navigation
  navigation: 'flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-2',
  mobileNavButton: 'w-full sm:w-auto justify-center sm:justify-start text-sm sm:text-base px-3 sm:px-4 py-2',
  
  // Form layouts
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  formRow: 'flex flex-col sm:flex-row gap-3 sm:gap-4'
} as const

/**
 * Utility function to conditionally apply responsive classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Generate responsive breakpoint classes dynamically
 */
export function responsive(config: {
  mobile?: string
  tablet?: string  
  desktop?: string
  large?: string
}): string {
  const classes = []
  
  if (config.mobile) classes.push(config.mobile)
  if (config.tablet) classes.push(`sm:${config.tablet}`)
  if (config.desktop) classes.push(`lg:${config.desktop}`)
  if (config.large) classes.push(`xl:${config.large}`)
  
  return classes.join(' ')
}

/**
 * Common responsive display utilities
 */
export const responsiveDisplay = {
  // Hide on mobile, show on larger screens
  hideOnMobile: 'hidden sm:block',
  
  // Show on mobile, hide on larger screens  
  showOnMobile: 'block sm:hidden',
  
  // Responsive flex direction
  flexColumn: 'flex flex-col',
  flexRow: 'flex flex-row',
  responsiveFlex: 'flex flex-col sm:flex-row',
  
  // Responsive text alignment
  textCenter: 'text-center',
  responsiveTextAlign: 'text-left sm:text-center',
  
  // Responsive overflow handling
  truncate: 'truncate',
  responsiveTruncate: 'truncate max-w-[120px] sm:max-w-none'
} as const