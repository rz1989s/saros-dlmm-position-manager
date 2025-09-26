'use client'

import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BarChart3, Zap, Menu, X, Settings, User } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: ReactNode
  href: string
  badge?: number
  disabled?: boolean
}

interface MobileTabBarProps {
  items: NavItem[]
  className?: string
  activeColor?: string
  inactiveColor?: string
  showLabels?: boolean
  hapticFeedback?: boolean
}

export function MobileTabBar({
  items,
  className = '',
  activeColor = '#6366f1',
  inactiveColor = '#6b7280',
  showLabels = true,
  hapticFeedback = true
}: MobileTabBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeItem, setActiveItem] = useState(items[0]?.id || '')

  useEffect(() => {
    const currentItem = items.find(item => pathname === item.href)
    if (currentItem) {
      setActiveItem(currentItem.id)
    }
  }, [pathname, items])

  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleItemPress = (item: NavItem) => {
    if (item.disabled) return

    triggerHaptic()
    setActiveItem(item.id)
    router.push(item.href)
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      <div className="bg-background border-t border-border backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {items.map((item) => {
            const isActive = activeItem === item.id
            const iconColor = isActive ? activeColor : inactiveColor

            return (
              <motion.button
                key={item.id}
                className={`relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => handleItemPress(item)}
                whileTap={item.disabled ? undefined : { scale: 0.95 }}
                disabled={item.disabled}
              >
                {/* Active indicator */}
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-current rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: isActive ? 24 : 0,
                    opacity: isActive ? 1 : 0
                  }}
                  style={{ color: activeColor }}
                  transition={{ duration: 0.2 }}
                />

                {/* Icon */}
                <motion.div
                  className="relative mb-1"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: iconColor
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                {showLabels && (
                  <motion.span
                    className="text-xs font-medium truncate max-w-full"
                    animate={{ color: iconColor }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
  position?: 'left' | 'right'
  width?: string | number
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  position = 'left',
  width = '280px'
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
    return undefined
  }, [isOpen])

  const drawerVariants = {
    initial: {
      x: position === 'left' ? '-100%' : '100%'
    },
    animate: {
      x: 0
    },
    exit: {
      x: position === 'left' ? '-100%' : '100%'
    }
  }

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={`fixed top-0 bottom-0 bg-background border-r border-border shadow-xl z-50 ${
              position === 'left' ? 'left-0' : 'right-0'
            } ${className}`}
            style={{ width }}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">{title}</h2>
                <motion.button
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  onClick={onClose}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface MobileMenuProps {
  trigger?: ReactNode
  className?: string
}

export function MobileMenu({ trigger, className = '' }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      href: '/'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/analytics'
    },
    {
      id: 'strategies',
      label: 'Strategies',
      icon: <Zap className="h-5 w-5" />,
      href: '/strategies'
    }
  ]

  const menuItems = [
    ...navigationItems,
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: '/profile'
    }
  ]

  const handleItemClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger */}
      <motion.button
        className={`p-2 rounded-lg hover:bg-muted transition-colors ${className}`}
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.95 }}
      >
        {trigger || <Menu className="h-5 w-5" />}
      </motion.button>

      {/* Drawer */}
      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Menu"
        position="left"
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <motion.button
                key={item.id}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleItemClick(item.href)}
                whileTap={{ scale: 0.98 }}
              >
                <div className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </MobileDrawer>
    </>
  )
}

interface BottomTabNavigationProps {
  className?: string
}

export function BottomTabNavigation({ className = '' }: BottomTabNavigationProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/analytics'
    },
    {
      id: 'strategies',
      label: 'Strategies',
      icon: <Zap className="h-5 w-5" />,
      href: '/strategies'
    }
  ]

  return (
    <MobileTabBar
      items={navItems}
      className={className}
      activeColor="#6366f1"
      inactiveColor="#6b7280"
      showLabels={true}
      hapticFeedback={true}
    />
  )
}

interface SwipeNavigationProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  threshold?: number
}

export function SwipeNavigation({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  threshold = 100
}: SwipeNavigationProps) {
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
  }

  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  )
}