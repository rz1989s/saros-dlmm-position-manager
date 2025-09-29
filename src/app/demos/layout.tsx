'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useJudgeMode } from '@/contexts/judge-mode-context'
import {
  ArrowLeft,
  Menu,
  X,
  Home,
  Activity,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoLayoutProps {
  children: React.ReactNode
}

const DEMO_NAVIGATION = [
  {
    category: 'Phase 1 - Core Operations',
    demos: [
      { id: 'swap-operations', title: 'Swap Operations', path: '/demos/swap-operations', status: 'planned' },
      { id: 'position-creation', title: 'Position Creation', path: '/demos/position-creation', status: 'planned' }
    ]
  },
  {
    category: 'Phase 1 - Oracle Integration',
    demos: [
      { id: 'pyth-integration', title: 'Pyth Network', path: '/demos/pyth-integration', status: 'planned' },
      { id: 'price-confidence', title: 'Price Confidence', path: '/demos/price-confidence', status: 'planned' },
      { id: 'oracle-fallback', title: 'Oracle Fallback', path: '/demos/oracle-fallback', status: 'planned' }
    ]
  },
  {
    category: 'Live Demos',
    demos: [
      { id: 'positions', title: 'Position Management', path: '/positions', status: 'live' },
      { id: 'analytics', title: 'Analytics Dashboard', path: '/analytics', status: 'live' },
      { id: 'strategies', title: 'Trading Strategies', path: '/strategies', status: 'live' }
    ]
  }
]

export default function DemosLayout({ children }: DemoLayoutProps) {
  const pathname = usePathname()
  const { isJudgeMode } = useJudgeMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isMainDemoPage = pathname === '/demos'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isMainDemoPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  {sidebarOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Link href="/demos" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-saros-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-saros-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">DLMM SDK Demos</h1>
                  <p className="text-xs text-muted-foreground -mt-1">Interactive SDK Showcase</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {isJudgeMode && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Judge Mode Active
                </Badge>
              )}

              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Main App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {!isMainDemoPage && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 border-r bg-muted/30 min-h-[calc(100vh-73px)]">
              <div className="p-4 space-y-6">
                <Link href="/demos">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Demo Hub
                  </Button>
                </Link>

                <div className="space-y-4">
                  {DEMO_NAVIGATION.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">
                        {category.category}
                      </h3>
                      <div className="space-y-1">
                        {category.demos.map((demo) => (
                          <Link key={demo.id} href={demo.path}>
                            <Button
                              variant={pathname === demo.path ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                            >
                              <Activity className="h-4 w-4 mr-2" />
                              <span className="truncate">{demo.title}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "ml-auto text-xs",
                                  demo.status === 'live' ? 'bg-green-100 text-green-700' :
                                  demo.status === 'beta' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                )}
                              >
                                {demo.status}
                              </Badge>
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.aside
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="lg:hidden fixed left-0 top-[73px] bottom-0 w-64 border-r bg-background z-40 overflow-y-auto"
                >
                  <div className="p-4 space-y-6">
                    <Link href="/demos">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Demo Hub
                      </Button>
                    </Link>

                    <div className="space-y-4">
                      {DEMO_NAVIGATION.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground px-2">
                            {category.category}
                          </h3>
                          <div className="space-y-1">
                            {category.demos.map((demo) => (
                              <Link key={demo.id} href={demo.path}>
                                <Button
                                  variant={pathname === demo.path ? "secondary" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <Activity className="h-4 w-4 mr-2" />
                                  <span className="truncate">{demo.title}</span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "ml-auto text-xs",
                                      demo.status === 'live' ? 'bg-green-100 text-green-700' :
                                      demo.status === 'beta' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    )}
                                  >
                                    {demo.status}
                                  </Badge>
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-[calc(100vh-73px)]",
          !isMainDemoPage && "lg:ml-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}