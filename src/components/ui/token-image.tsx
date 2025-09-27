'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TokenImageProps {
  src?: string | null
  alt: string
  width: number
  height: number
  className?: string
}

export function TokenImage({ src, alt, width, height, className }: TokenImageProps) {
  const [hasError, setHasError] = useState(false)

  const fallbackSrc = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${width/2}" cy="${height/2}" r="${width/2-1}" fill="#6B7280" stroke="#9CA3AF" stroke-width="1"/>
      <text x="${width/2}" y="${height/2+4}" text-anchor="middle" fill="white" font-family="system-ui" font-size="${Math.max(10, width/3)}" font-weight="600">
        ${alt.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  `)}`

  if (!src || hasError) {
    return (
      <div
        className={cn('rounded-full flex items-center justify-center bg-muted border-2 border-background', className)}
        style={{ width, height }}
      >
        <Image
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          className="rounded-full"
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('rounded-full border-2 border-background', className)}
      onError={() => setHasError(true)}
    />
  )
}