'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export class FocusManager {
  private static focusStack: Element[] = []

  static trapFocus(container: Element) {
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Focus first element
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  static getFocusableElements(container: Element): Element[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        const style = window.getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
  }

  static saveFocus() {
    const activeElement = document.activeElement
    if (activeElement) {
      this.focusStack.push(activeElement)
    }
  }

  static restoreFocus() {
    const element = this.focusStack.pop()
    if (element && element instanceof HTMLElement) {
      element.focus()
    }
  }

  static moveFocusToElement(element: HTMLElement) {
    this.saveFocus()
    element.focus()
  }
}

// Keyboard navigation utilities
export const KeyboardKeys = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const

export function handleKeyboardNavigation(
  event: KeyboardEvent,
  handlers: Partial<Record<keyof typeof KeyboardKeys, () => void>>
) {
  const key = event.key as keyof typeof KeyboardKeys
  const handler = handlers[key]

  if (handler) {
    event.preventDefault()
    handler()
  }
}

// ARIA utilities
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function createAriaRelationship(
  element: Element,
  relatedElement: Element,
  relationship: 'describedby' | 'labelledby' | 'controls' | 'owns'
) {
  const relatedId = relatedElement.id || generateId()
  if (!relatedElement.id) {
    relatedElement.id = relatedId
  }

  const existingIds = element.getAttribute(`aria-${relationship}`)?.split(' ') || []
  if (!existingIds.includes(relatedId)) {
    existingIds.push(relatedId)
    element.setAttribute(`aria-${relationship}`, existingIds.join(' '))
  }
}

// Color contrast utilities
export function getContrastRatio(foreground: string, background: string): number {
  const rgb1 = hexToRgb(foreground)
  const rgb2 = hexToRgb(background)

  if (!rgb1 || !rgb2) return 1

  const l1 = getRelativeLuminance(rgb1)
  const l2 = getRelativeLuminance(rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const sRGB = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background)

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5
  }
}

// Motion preferences
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

// High contrast mode detection
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return highContrast
}

// Focus visible detection
export function useFocusVisible(): {
  isFocusVisible: boolean
  onFocus: (e: FocusEvent) => void
  onBlur: (e: FocusEvent) => void
  onKeyDown: (e: KeyboardEvent) => void
  onPointerDown: (e: PointerEvent) => void
} {
  const [hadKeyboardEvent, setHadKeyboardEvent] = useState(true)
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey) return
    setHadKeyboardEvent(true)
  }, [])

  const onPointerDown = useCallback(() => {
    setHadKeyboardEvent(false)
  }, [])

  const onFocus = useCallback((e: FocusEvent) => {
    if (hadKeyboardEvent || (e.target as Element).matches(':focus-visible')) {
      setIsFocusVisible(true)
    }
  }, [hadKeyboardEvent])

  const onBlur = useCallback(() => {
    setIsFocusVisible(false)
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [onKeyDown, onPointerDown])

  return { isFocusVisible, onFocus, onBlur, onKeyDown, onPointerDown }
}

// Screen reader detection
export function useScreenReader(): boolean {
  const [isScreenReader, setIsScreenReader] = useState(false)

  useEffect(() => {
    // Check for common screen readers
    const userAgent = navigator.userAgent.toLowerCase()
    const screenReaders = ['nvda', 'jaws', 'voiceover', 'orca', 'talkback']

    const hasScreenReader = screenReaders.some(sr => userAgent.includes(sr))
    setIsScreenReader(hasScreenReader)

    // Also check for speech synthesis
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices()
      setIsScreenReader(prev => prev || voices.length > 0)
    }
  }, [])

  return isScreenReader
}

// Live region management
export class LiveRegionManager {
  private static regions = new Map<string, HTMLElement>()

  static createRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    if (this.regions.has(id)) {
      return this.regions.get(id)!
    }

    const region = document.createElement('div')
    region.id = id
    region.setAttribute('aria-live', priority)
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only'
    region.style.position = 'absolute'
    region.style.left = '-10000px'
    region.style.width = '1px'
    region.style.height = '1px'
    region.style.overflow = 'hidden'

    document.body.appendChild(region)
    this.regions.set(id, region)

    return region
  }

  static announce(message: string, regionId: string = 'default', priority: 'polite' | 'assertive' = 'polite') {
    const region = this.createRegion(regionId, priority)
    region.textContent = message
  }

  static clear(regionId: string = 'default') {
    const region = this.regions.get(regionId)
    if (region) {
      region.textContent = ''
    }
  }

  static remove(regionId: string) {
    const region = this.regions.get(regionId)
    if (region) {
      document.body.removeChild(region)
      this.regions.delete(regionId)
    }
  }
}

// Text formatting for screen readers
export function formatNumberForScreenReader(num: number): string {
  // Convert numbers to more readable format for screen readers
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'long'
  })

  return formatter.format(num)
}

export function formatPercentageForScreenReader(percentage: number): string {
  return `${percentage.toFixed(2)} percent`
}

export function formatCurrencyForScreenReader(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'name'
  })

  return formatter.format(amount)
}

// Skip link utilities
export function createSkipLink(targetId: string, label: string): HTMLElement {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = label
  skipLink.className = 'skip-link'
  skipLink.style.cssText = `
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    background: var(--primary);
    color: var(--primary-foreground);
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 0.25rem;
    z-index: 1000;
    transition: all 0.3s ease;
  `

  skipLink.addEventListener('focus', () => {
    skipLink.style.left = '1rem'
    skipLink.style.top = '1rem'
    skipLink.style.width = 'auto'
    skipLink.style.height = 'auto'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.left = '-10000px'
    skipLink.style.top = 'auto'
    skipLink.style.width = '1px'
    skipLink.style.height = '1px'
  })

  return skipLink
}

// Accessibility testing utilities
export function runA11yAudit(element: Element = document.body): Promise<any[]> {
  // Basic accessibility checks
  const issues: any[] = []

  // Check for missing alt text
  const images = element.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push({
        type: 'missing-alt-text',
        element: img,
        message: `Image ${index + 1} is missing alt text`,
        severity: 'error'
      })
    }
  })

  // Check for missing form labels
  const inputs = element.querySelectorAll('input, textarea, select')
  inputs.forEach((input, index) => {
    const id = input.id
    const hasLabel = id && element.querySelector(`label[for="${id}"]`)
    const hasAriaLabel = input.getAttribute('aria-label')
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby')

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: 'missing-label',
        element: input,
        message: `Form control ${index + 1} is missing a label`,
        severity: 'error'
      })
    }
  })

  // Check for missing heading structure
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  const headingLevels = headings.map(h => parseInt(h.tagName[1]))

  for (let i = 1; i < headingLevels.length; i++) {
    const current = headingLevels[i]
    const previous = headingLevels[i - 1]

    if (current > previous + 1) {
      issues.push({
        type: 'heading-skip',
        element: headings[i],
        message: `Heading level skipped from h${previous} to h${current}`,
        severity: 'warning'
      })
    }
  }

  return Promise.resolve(issues)
}

// Export utility functions
export const a11y = {
  announce: announceToScreenReader,
  FocusManager,
  LiveRegionManager,
  formatNumberForScreenReader,
  formatPercentageForScreenReader,
  formatCurrencyForScreenReader,
  createSkipLink,
  runA11yAudit,
  meetsWCAGContrast,
  getContrastRatio,
  generateId,
  createAriaRelationship,
  handleKeyboardNavigation,
  KeyboardKeys
}