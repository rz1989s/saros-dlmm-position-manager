'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff, Gavel } from 'lucide-react'
import { useJudgeMode } from '@/contexts/judge-mode-context'
import { cn } from '@/lib/utils'

interface JudgeModeToggleProps {
  variant?: 'button' | 'switch'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

export function JudgeModeToggle({
  variant = 'button',
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
}: JudgeModeToggleProps) {
  const { isJudgeMode, toggleJudgeMode, visibleFeatures } = useJudgeMode()

  const IconComponent = isJudgeMode ? Eye : EyeOff

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && <Gavel className="h-4 w-4 text-muted-foreground" />}
        {showLabel && (
          <span className="text-sm text-muted-foreground">
            Judge Mode {isJudgeMode && `(${visibleFeatures.size} features)`}
          </span>
        )}
        <Switch
          checked={isJudgeMode}
          onCheckedChange={toggleJudgeMode}
          aria-label="Toggle judge mode"
        />
      </div>
    )
  }

  return (
    <Button
      variant={isJudgeMode ? 'default' : 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      onClick={toggleJudgeMode}
      className={cn(
        'transition-all duration-200',
        isJudgeMode && 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
        sizeClasses[size],
        className
      )}
      aria-label={`${isJudgeMode ? 'Disable' : 'Enable'} judge mode`}
    >
      {showIcon && <IconComponent className="h-4 w-4" />}
      {showLabel && (
        <span className={cn(showIcon && 'ml-2')}>
          Judge Mode {isJudgeMode && `(${visibleFeatures.size})`}
        </span>
      )}
    </Button>
  )
}