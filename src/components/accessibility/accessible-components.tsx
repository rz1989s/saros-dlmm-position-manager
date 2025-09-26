'use client'

import React, { forwardRef, useEffect, useRef, useState, ReactNode } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  useReducedMotion,
  useFocusVisible,
  announceToScreenReader,
  FocusManager,
  LiveRegionManager,
  generateId,
  handleKeyboardNavigation
} from '@/lib/accessibility'

// Accessible Motion wrapper
interface AccessibleMotionProps extends MotionProps {
  children: ReactNode
  reduceMotion?: boolean
  className?: string
  id?: string
  role?: string
  'aria-labelledby'?: string
}

export const AccessibleMotion = forwardRef<HTMLDivElement, AccessibleMotionProps>(
  ({ children, reduceMotion, className, id, role, 'aria-labelledby': ariaLabelledBy, ...motionProps }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const shouldReduceMotion = reduceMotion ?? prefersReducedMotion

    const commonProps = {
      id,
      role,
      'aria-labelledby': ariaLabelledBy,
      className
    }

    if (shouldReduceMotion) {
      return (
        <div ref={ref} {...commonProps}>
          {children}
        </div>
      )
    }

    return (
      <motion.div ref={ref} {...commonProps} {...motionProps}>
        {children}
      </motion.div>
    )
  }
)
AccessibleMotion.displayName = 'AccessibleMotion'

// Screen Reader Only Text
interface ScreenReaderOnlyProps {
  children: ReactNode
  announce?: boolean
  priority?: 'polite' | 'assertive'
}

export function ScreenReaderOnly({
  children,
  announce = false,
  priority = 'polite'
}: ScreenReaderOnlyProps) {
  useEffect(() => {
    if (announce && typeof children === 'string') {
      announceToScreenReader(children, priority)
    }
  }, [children, announce, priority])

  return (
    <span className="sr-only absolute left-[-10000px] top-auto w-px h-px overflow-hidden">
      {children}
    </span>
  )
}

// Accessible Collapsible Section
interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className = '',
  titleLevel = 3
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = useRef(generateId('collapsible-content')).current
  const buttonId = useRef(generateId('collapsible-button')).current
  const { isFocusVisible, onFocus: onNativeFocus, onBlur: onNativeBlur } = useFocusVisible()

  const onFocus = (e: React.FocusEvent) => onNativeFocus(e.nativeEvent)
  const onBlur = (e: React.FocusEvent) => onNativeBlur(e.nativeEvent)

  const HeadingTag = `h${titleLevel}` as keyof JSX.IntrinsicElements

  const handleToggle = () => {
    setIsOpen(!isOpen)
    announceToScreenReader(
      isOpen ? `${title} section collapsed` : `${title} section expanded`
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyboardNavigation(e.nativeEvent, {
      ENTER: handleToggle,
      SPACE: handleToggle
    })
  }

  return (
    <div className={cn('border rounded-lg', className)}>
      <HeadingTag className="m-0">
        <button
          id={buttonId}
          className={cn(
            'w-full flex items-center justify-between p-4 text-left',
            'hover:bg-muted/50 focus:bg-muted/50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            isFocusVisible && 'ring-2 ring-ring ring-offset-2'
          )}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <span className="font-semibold">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </HeadingTag>

      <AccessibleMotion
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        initial={{ height: defaultOpen ? 'auto' : 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="p-4 border-t">
          {children}
        </div>
      </AccessibleMotion>
    </div>
  )
}

// Accessible Status Badge
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: ReactNode
  showIcon?: boolean
  announce?: boolean
}

export function StatusBadge({
  status,
  children,
  showIcon = true,
  announce = false
}: StatusBadgeProps) {
  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: X,
    info: Info,
    neutral: Info
  }

  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const Icon = icons[status]
  const statusLabel = status === 'neutral' ? 'information' : status

  useEffect(() => {
    if (announce && typeof children === 'string') {
      announceToScreenReader(`${statusLabel}: ${children}`)
    }
  }, [children, statusLabel, announce])

  return (
    <Badge
      className={cn('inline-flex items-center gap-1', variants[status])}
      role="status"
      aria-label={`${statusLabel}: ${children}`}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
      <ScreenReaderOnly>{statusLabel}</ScreenReaderOnly>
    </Badge>
  )
}

// Accessible Progress Indicator
interface ProgressIndicatorProps {
  value: number
  max?: number
  label: string
  showValue?: boolean
  className?: string
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  showValue = true,
  className = ''
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100)
  const progressId = useRef(generateId('progress')).current

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <label htmlFor={progressId} className="text-sm font-medium">
          {label}
        </label>
        {showValue && (
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            {percentage}%
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={progressId}
        aria-valuetext={`${percentage} percent complete`}
        className="w-full bg-muted rounded-full h-2 overflow-hidden"
      >
        <AccessibleMotion
          className="h-full bg-primary rounded-full transition-all duration-300"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        >
          <span className="sr-only">{percentage}% complete</span>
        </AccessibleMotion>
      </div>

      <ScreenReaderOnly announce>
        {label} {percentage} percent complete
      </ScreenReaderOnly>
    </div>
  )
}

// Accessible Skip Links
interface SkipLinksProps {
  links: Array<{
    href: string
    label: string
  }>
}

export function SkipLinks({ links }: SkipLinksProps) {
  return (
    <nav
      aria-label="Skip to page sections"
      className="skip-links fixed top-0 left-0 z-[1000]"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={cn(
            'absolute left-[-10000px] top-auto w-px h-px overflow-hidden',
            'bg-primary text-primary-foreground px-4 py-2 text-sm font-medium',
            'rounded-md focus:left-4 focus:top-4 focus:w-auto focus:h-auto',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'transition-all duration-150'
          )}
          onFocus={(e) => {
            e.currentTarget.style.left = '1rem'
            e.currentTarget.style.top = '1rem'
            e.currentTarget.style.width = 'auto'
            e.currentTarget.style.height = 'auto'
          }}
          onBlur={(e) => {
            e.currentTarget.style.left = '-10000px'
            e.currentTarget.style.top = 'auto'
            e.currentTarget.style.width = '1px'
            e.currentTarget.style.height = '1px'
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

// Accessible Data Table
interface AccessibleTableProps {
  data: any[]
  columns: Array<{
    key: string
    header: string
    sortable?: boolean
    format?: (value: any) => string
  }>
  caption: string
  className?: string
}

export function AccessibleTable({
  data,
  columns,
  caption,
  className = ''
}: AccessibleTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (columnKey: string) => {
    if (!columns.find(col => col.key === columnKey)?.sortable) return

    const direction =
      sortConfig?.key === columnKey && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc'

    setSortConfig({ key: columnKey, direction })

    announceToScreenReader(
      `Table sorted by ${columns.find(col => col.key === columnKey)?.header} in ${direction}ending order`
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse border border-border" role="table">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'border border-border px-4 py-2 text-left font-semibold',
                  column.sortable && 'cursor-pointer hover:bg-muted/50'
                )}
                onClick={() => column.sortable && handleSort(column.key)}
                onKeyDown={(e) => {
                  if (column.sortable) {
                    handleKeyboardNavigation(e.nativeEvent, {
                      ENTER: () => handleSort(column.key),
                      SPACE: () => handleSort(column.key)
                    })
                  }
                }}
                tabIndex={column.sortable ? 0 : undefined}
                role={column.sortable ? 'columnheader button' : 'columnheader'}
                aria-sort={
                  sortConfig?.key === column.key
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : column.sortable
                    ? 'none'
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <div className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          'h-3 w-3',
                          sortConfig?.key === column.key &&
                            sortConfig.direction === 'asc'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                        aria-hidden="true"
                      />
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 -mt-1',
                          sortConfig?.key === column.key &&
                            sortConfig.direction === 'desc'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/25">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="border border-border px-4 py-2"
                  role="gridcell"
                >
                  {column.format
                    ? column.format(row[column.key])
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground" role="status">
          No data available
        </div>
      )}
    </div>
  )
}

// Accessible Form Field
interface AccessibleFormFieldProps {
  label: string
  children: ReactNode
  error?: string
  description?: string
  required?: boolean
  className?: string
}

export function AccessibleFormField({
  label,
  children,
  error,
  description,
  required = false,
  className = ''
}: AccessibleFormFieldProps) {
  const fieldId = useRef(generateId('field')).current
  const errorId = useRef(generateId('error')).current
  const descriptionId = useRef(generateId('description')).current

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-destructive" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': [
            description ? descriptionId : '',
            error ? errorId : ''
          ]
            .filter(Boolean)
            .join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required
        })}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading',
  className = ''
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label={label}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizes[size]
        )}
        aria-hidden="true"
      />
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </div>
  )
}

export {
  useReducedMotion,
  useFocusVisible,
  announceToScreenReader,
  FocusManager,
  LiveRegionManager
}