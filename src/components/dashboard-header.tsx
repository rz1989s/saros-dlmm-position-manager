'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Activity, BarChart3, Home, TrendingUp, Trophy, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Positions', href: '/', icon: Home, active: pathname === '/' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, active: pathname === '/analytics' },
    { name: 'Strategies', href: '/strategies', icon: TrendingUp, active: pathname === '/strategies' },
    { name: 'Backtesting', href: '/backtesting', icon: TestTube, active: pathname === '/backtesting' },
    { name: 'Showcase', href: '/showcase', icon: Trophy, active: pathname === '/showcase', highlight: true },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text break-words">
            Saros DLMM Position Manager
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Manage your Dynamic Liquidity Market Maker positions with advanced analytics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-sm order-2 sm:order-1">
            <div className="pulse-dot"></div>
            <span className="text-muted-foreground whitespace-nowrap">Live on Solana</span>
          </div>
          
          <div className="order-1 sm:order-2 w-full sm:w-auto">
            <WalletMultiButton className="!bg-saros-primary hover:!bg-saros-secondary transition-colors !w-full sm:!w-auto !text-sm sm:!text-base" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pb-4 border-b">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="flex-1 sm:flex-initial">
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full sm:w-auto justify-center sm:justify-start text-sm sm:text-base px-3 sm:px-4 py-2 ${
                  item.active ? "bg-saros-primary text-white" : ""
                } ${
                  (item as any).highlight && !item.active ? "border border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100" : ""
                }`}
              >
                <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}