import { useState, useEffect, useCallback, useRef } from 'react'

export interface TouchPosition {
  x: number
  y: number
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  velocity: number
}

export interface UseSwipeGestureOptions {
  minDistance?: number
  maxTime?: number
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  preventDefaultTouchMove?: boolean
}

export function useSwipeGesture({
  minDistance = 50,
  maxTime = 500,
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  preventDefaultTouchMove = false
}: UseSwipeGestureOptions = {}) {
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null)
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>({
    direction: null,
    distance: 0,
    velocity: 0
  })
  const [isSwipng, setIsSwiping] = useState(false)
  const startTime = useRef<number>(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
    setIsSwiping(true)
    startTime.current = Date.now()
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefaultTouchMove) {
      e.preventDefault()
    }

    if (!touchStart) return

    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [touchStart, preventDefaultTouchMove])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false)
      return
    }

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const endTime = Date.now()
    const timeDiff = endTime - startTime.current

    // Calculate distance and velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / timeDiff

    // Determine direction
    let direction: 'left' | 'right' | 'up' | 'down' | null = null

    if (distance > minDistance && timeDiff < maxTime) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          direction = deltaX > 0 ? 'left' : 'right'
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          direction = deltaY > 0 ? 'up' : 'down'
        }
      }
    }

    setSwipeDirection({ direction, distance, velocity })

    // Trigger callbacks
    switch (direction) {
      case 'left':
        onSwipeLeft?.()
        break
      case 'right':
        onSwipeRight?.()
        break
      case 'up':
        onSwipeUp?.()
        break
      case 'down':
        onSwipeDown?.()
        break
    }

    setIsSwiping(false)
    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, minDistance, maxTime, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    swipeDirection,
    isSwipng,
    touchEvents: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

export interface UseLongPressOptions {
  delay?: number
  onLongPress?: () => void
  onShortPress?: () => void
  threshold?: number
}

export function useLongPress({
  delay = 500,
  onLongPress,
  onShortPress,
  threshold = 10
}: UseLongPressOptions = {}) {
  const [isPressed, setIsPressed] = useState(false)
  const [startPosition, setStartPosition] = useState<TouchPosition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const startTime = useRef<number>(0)

  const handleStart = useCallback((e: TouchEvent | MouseEvent) => {
    const position = 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY }

    setStartPosition(position)
    setIsPressed(true)
    startTime.current = Date.now()

    timeoutRef.current = setTimeout(() => {
      onLongPress?.()
    }, delay)
  }, [delay, onLongPress])

  const handleEnd = useCallback((e: TouchEvent | MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const endTime = Date.now()
    const pressDuration = endTime - startTime.current

    if (pressDuration < delay) {
      onShortPress?.()
    }

    setIsPressed(false)
    setStartPosition(null)
  }, [delay, onShortPress])

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!startPosition || !isPressed) return

    const currentPosition = 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY }

    const distance = Math.sqrt(
      Math.pow(currentPosition.x - startPosition.x, 2) +
      Math.pow(currentPosition.y - startPosition.y, 2)
    )

    if (distance > threshold) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsPressed(false)
    }
  }, [startPosition, isPressed, threshold])

  const touchEvents = {
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchMove: handleMove,
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseMove: handleMove,
    onMouseLeave: handleEnd
  }

  return {
    isPressed,
    touchEvents
  }
}

export interface UsePinchZoomOptions {
  minZoom?: number
  maxZoom?: number
  onZoom?: (scale: number) => void
  onZoomStart?: () => void
  onZoomEnd?: () => void
}

export function usePinchZoom({
  minZoom = 0.5,
  maxZoom = 3,
  onZoom,
  onZoomStart,
  onZoomEnd
}: UsePinchZoomOptions = {}) {
  const [scale, setScale] = useState(1)
  const [isZooming, setIsZooming] = useState(false)
  const initialDistance = useRef<number>(0)
  const initialScale = useRef<number>(1)

  const getDistance = (touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch1.clientX - touch2.clientX, 2) +
      Math.pow(touch1.clientY - touch2.clientY, 2)
    )
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      setIsZooming(true)
      initialDistance.current = getDistance(e.touches[0], e.touches[1])
      initialScale.current = scale
      onZoomStart?.()
    }
  }, [scale, onZoomStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isZooming) {
      e.preventDefault()

      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const ratio = currentDistance / initialDistance.current
      const newScale = Math.min(Math.max(initialScale.current * ratio, minZoom), maxZoom)

      setScale(newScale)
      onZoom?.(newScale)
    }
  }, [isZooming, minZoom, maxZoom, onZoom])

  const handleTouchEnd = useCallback(() => {
    if (isZooming) {
      setIsZooming(false)
      onZoomEnd?.()
    }
  }, [isZooming, onZoomEnd])

  const reset = useCallback(() => {
    setScale(1)
    onZoom?.(1)
  }, [onZoom])

  return {
    scale,
    isZooming,
    reset,
    touchEvents: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

export interface UsePullToRefreshOptions {
  threshold?: number
  onRefresh?: () => Promise<void> | void
  refreshingMessage?: string
  disabled?: boolean
}

export function usePullToRefresh({
  threshold = 80,
  onRefresh,
  refreshingMessage = 'Refreshing...',
  disabled = false
}: UsePullToRefreshOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [canRefresh, setCanRefresh] = useState(false)
  const startY = useRef<number>(0)
  const isPulling = useRef<boolean>(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return

    startY.current = e.touches[0].clientY
    isPulling.current = false
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY.current

    // Only start pulling if scrolled to top and pulling down
    if (deltaY > 0 && window.scrollY === 0) {
      isPulling.current = true
      e.preventDefault()

      const distance = Math.min(deltaY * 0.5, threshold * 1.5)
      setPullDistance(distance)
      setCanRefresh(distance >= threshold)
    }
  }, [disabled, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling.current) return

    if (canRefresh && onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
    setCanRefresh(false)
    isPulling.current = false
  }, [disabled, isRefreshing, canRefresh, onRefresh])

  const refresh = useCallback(async () => {
    if (disabled || isRefreshing || !onRefresh) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [disabled, isRefreshing, onRefresh])

  return {
    isRefreshing,
    pullDistance,
    canRefresh,
    refresh,
    touchEvents: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  const light = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(25)
    }
  }, [isSupported])

  const medium = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(50)
    }
  }, [isSupported])

  const heavy = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(100)
    }
  }, [isSupported])

  const pattern = useCallback((pattern: number[]) => {
    if (isSupported) {
      navigator.vibrate(pattern)
    }
  }, [isSupported])

  const success = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([50, 50, 50])
    }
  }, [isSupported])

  const error = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([100, 50, 100])
    }
  }, [isSupported])

  return {
    isSupported,
    light,
    medium,
    heavy,
    pattern,
    success,
    error
  }
}

export interface UseDoubleTapOptions {
  delay?: number
  onDoubleTap?: () => void
  onSingleTap?: () => void
}

export function useDoubleTap({
  delay = 300,
  onDoubleTap,
  onSingleTap
}: UseDoubleTapOptions = {}) {
  const [tapCount, setTapCount] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleTap = useCallback(() => {
    setTapCount(prev => prev + 1)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (tapCount === 0) {
        onDoubleTap?.()
      } else {
        onSingleTap?.()
      }
      setTapCount(0)
    }, delay)
  }, [tapCount, delay, onDoubleTap, onSingleTap])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { handleTap }
}