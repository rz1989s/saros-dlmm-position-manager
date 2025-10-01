'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Layers,
  LineChart,
  Target,
  TrendingUp,
  ArrowRight,
  Home,
  PlayCircle,
  Trophy,
  PieChart,
  Shield,
  ArrowLeftRight,
  DollarSign,
  Settings,
  FileText
} from 'lucide-react'

export default function ApplicationsHub() {
  const applications = [
    {
      href: '/positions',
      icon: Layers,
      title: 'Position Manager',
      description: 'View and manage all your DLMM positions with real-time updates and comprehensive analytics',
      color: 'from-indigo-600 to-purple-600',
      hoverColor: 'hover:border-indigo-500',
      bgHover: 'group-hover:bg-indigo-50'
    },
    {
      href: '/analytics',
      icon: LineChart,
      title: 'Analytics Dashboard',
      description: 'Track P&L, fees earned, and portfolio performance with detailed charts and insights',
      color: 'from-green-600 to-emerald-600',
      hoverColor: 'hover:border-green-500',
      bgHover: 'group-hover:bg-green-50'
    },
    {
      href: '/portfolio',
      icon: PieChart,
      title: 'Portfolio Center',
      description: 'Multi-position analysis, optimization, diversification scoring, and consolidation opportunities',
      color: 'from-blue-600 to-indigo-600',
      hoverColor: 'hover:border-blue-500',
      bgHover: 'group-hover:bg-blue-50'
    },
    {
      href: '/strategies',
      icon: Target,
      title: 'Strategy Manager',
      description: 'Automated rebalancing and limit orders for optimal returns and risk management',
      color: 'from-purple-600 to-pink-600',
      hoverColor: 'hover:border-purple-500',
      bgHover: 'group-hover:bg-purple-50'
    },
    {
      href: '/risk',
      icon: Shield,
      title: 'Risk Management',
      description: 'Real-time risk monitoring, IL tracking, stress testing, and alert configuration',
      color: 'from-red-600 to-orange-600',
      hoverColor: 'hover:border-red-500',
      bgHover: 'group-hover:bg-red-50'
    },
    {
      href: '/migration',
      icon: ArrowLeftRight,
      title: 'Migration Hub',
      description: 'Cross-pool migration with NPV analysis, Monte Carlo simulation, and automation',
      color: 'from-cyan-600 to-blue-600',
      hoverColor: 'hover:border-cyan-500',
      bgHover: 'group-hover:bg-cyan-50'
    },
    {
      href: '/fees',
      icon: DollarSign,
      title: 'Fee Optimization Center',
      description: 'AI-powered fee tier optimization, market intelligence, and advanced simulation',
      color: 'from-green-600 to-emerald-600',
      hoverColor: 'hover:border-green-500',
      bgHover: 'group-hover:bg-green-50'
    },
    {
      href: '/backtesting',
      icon: TrendingUp,
      title: 'Backtesting Tools',
      description: 'Test strategies against historical data before deployment to validate performance',
      color: 'from-blue-600 to-teal-600',
      hoverColor: 'hover:border-blue-500',
      bgHover: 'group-hover:bg-blue-50'
    },
    {
      href: '/reports',
      icon: FileText,
      title: 'Reports & Exports',
      description: 'Generate comprehensive reports, tax documents, and export portfolio data in multiple formats',
      color: 'from-indigo-600 to-purple-600',
      hoverColor: 'hover:border-indigo-500',
      bgHover: 'group-hover:bg-indigo-50'
    },
    {
      href: '/settings',
      icon: Settings,
      title: 'Settings & Configuration',
      description: 'Manage preferences, wallet settings, notifications, performance, and integrations',
      color: 'from-gray-600 to-slate-600',
      hoverColor: 'hover:border-gray-500',
      bgHover: 'group-hover:bg-gray-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold gradient-text">Live Applications</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
            <Layers className="w-4 h-4 mr-2" />
            10 Production-Ready Applications
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">DLMM Position Manager</span>
            <br />
            <span className="text-gray-900">Live Applications</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Access all core features of the platform - from position management to advanced analytics
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {applications.map((app) => (
            <Link key={app.href} href={app.href}>
              <Card className={`border-2 ${app.hoverColor} transition-all duration-300 hover:shadow-2xl cursor-pointer h-full group`}>
                <CardHeader className="pb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${app.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <app.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{app.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {app.description}
                  </p>
                  <Button variant="ghost" className={`w-full ${app.bgHover} font-medium`}>
                    Launch Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Links */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Explore More
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/demos">
              <Button variant="outline" className="w-full" size="lg">
                <PlayCircle className="mr-2 h-5 w-5" />
                69 Interactive Demos
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/showcase">
              <Button variant="outline" className="w-full" size="lg">
                <Trophy className="mr-2 h-5 w-5" />
                SDK Showcase
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Built for the Saros DLMM Demo Challenge • Live on Solana Mainnet</p>
        </div>
      </footer>
    </div>
  )
}
