'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Home, TrendingUp, Trophy, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientOnlyWalletButton } from '@/components/ui/client-only-wallet-button'

export function DashboardHeader() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Positions', href: '/positions', icon: Home, active: pathname === '/positions' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, active: pathname === '/analytics' },
    { name: 'Strategies', href: '/strategies', icon: TrendingUp, active: pathname === '/strategies' },
    { name: 'Backtesting', href: '/backtesting', icon: TestTube, active: pathname === '/backtesting' },
    { name: 'Demos', href: '/demos', icon: Trophy, active: pathname === '/demos', highlight: true },
    { name: 'Showcase', href: '/showcase', icon: Trophy, active: pathname === '/showcase', highlight: true },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 lg:gap-6">
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text break-words">
            Saros DLMM Position Manager
          </h1>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
            Manage your Dynamic Liquidity Market Maker positions with advanced analytics
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm order-2 xs:order-1">
            <div className="pulse-dot"></div>
            <span className="text-muted-foreground whitespace-nowrap hidden xs:inline">Live on Solana</span>
            <span className="text-muted-foreground xs:hidden">Live</span>
          </div>

          <div className="order-1 xs:order-2 w-full xs:w-auto">
            <ClientOnlyWalletButton className="!bg-saros-primary hover:!bg-saros-secondary transition-colors !w-full xs:!w-auto !text-xs xs:!text-sm sm:!text-base !px-3 xs:!px-4 !py-2" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pb-3 sm:pb-4 border-b">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 xs:gap-1.5 sm:gap-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="flex-1 sm:flex-initial min-w-[calc(50%-0.25rem)] xs:min-w-[calc(33.333%-0.375rem)] sm:min-w-0">
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full sm:w-auto justify-center sm:justify-start text-xs xs:text-sm sm:text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 ${
                  item.active ? "bg-saros-primary text-white" : ""
                } ${
                  (item as any).highlight && !item.active ? "border border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100" : ""
                }`}
              >
                <item.icon className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}