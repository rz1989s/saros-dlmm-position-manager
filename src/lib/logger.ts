// Enhanced logging utility with environment awareness
// Only logs in development, reduces noise in production builds

const isDevelopment = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args)
  },

  debug: (...args: any[]) => {
    if (isDevelopment && !isServer) {
      console.log(...args)
    }
  },

  // Special logger for build-time initialization (always silent during SSG)
  init: (...args: any[]) => {
    if (isDevelopment && !isServer) {
      console.log(...args)
    }
  }
}