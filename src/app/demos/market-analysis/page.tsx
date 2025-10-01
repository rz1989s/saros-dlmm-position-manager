'use client'

import React, { useState } from 'react'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { useDLMM } from '@/hooks/use-dlmm'

// Market Analysis Types
interface MarketMetrics {
  totalValueLocked: number
  volume24h: number
  volumeChange24h: number
  activePositions: number
  averageAPR: number
  marketSentiment: 'bullish' | 'bearish' | 'neutral'
}

interface PoolAnalytics {
  poolId: string
  pair: string
  liquidity: number
  volume24h: number
  fees24h: number
  apr: number
  priceChange24h: number
  liquidityDistribution: {
    concentrated: number
    uniform: number
    edge: number
  }
  binUtilization: number
}

interface TrendData {
  timestamp: number
  price: number
  volume: number
  liquidity: number
  volatility: number
  momentum: number
}

interface RiskMetrics {
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  valueAtRisk: number
  conditionalValueAtRisk: number
  correlationRisk: number
}

// Mock Data
const MARKET_METRICS: MarketMetrics = {
  totalValueLocked: 45600000,
  volume24h: 12300000,
  volumeChange24h: 8.5,
  activePositions: 2840,
  averageAPR: 34.7,
  marketSentiment: 'bullish'
}

const POOL_ANALYTICS: PoolAnalytics[] = [
  {
    poolId: 'sol-usdc-001',
    pair: 'SOL/USDC',
    liquidity: 8900000,
    volume24h: 4200000,
    fees24h: 42000,
    apr: 42.3,
    priceChange24h: 3.2,
    liquidityDistribution: { concentrated: 65, uniform: 25, edge: 10 },
    binUtilization: 78
  },
  {
    poolId: 'btc-sol-002',
    pair: 'BTC/SOL',
    liquidity: 6700000,
    volume24h: 2800000,
    fees24h: 28000,
    apr: 38.9,
    priceChange24h: -1.5,
    liquidityDistribution: { concentrated: 72, uniform: 20, edge: 8 },
    binUtilization: 85
  },
  {
    poolId: 'eth-usdc-003',
    pair: 'ETH/USDC',
    liquidity: 5400000,
    volume24h: 2100000,
    fees24h: 21000,
    apr: 35.1,
    priceChange24h: 2.8,
    liquidityDistribution: { concentrated: 68, uniform: 22, edge: 10 },
    binUtilization: 82
  },
  {
    poolId: 'ray-sol-004',
    pair: 'RAY/SOL',
    liquidity: 3200000,
    volume24h: 1400000,
    fees24h: 14000,
    apr: 29.6,
    priceChange24h: 5.7,
    liquidityDistribution: { concentrated: 60, uniform: 30, edge: 10 },
    binUtilization: 73
  }
]

const TREND_DATA: TrendData[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: Date.now() - (23 - i) * 3600000,
  price: 45 + Math.sin(i * 0.5) * 8 + Math.random() * 4,
  volume: 800000 + Math.random() * 400000,
  liquidity: 8900000 + Math.sin(i * 0.3) * 1200000,
  volatility: 0.15 + Math.random() * 0.1,
  momentum: Math.sin(i * 0.4) * 0.3 + Math.random() * 0.2
}))

const RISK_METRICS: RiskMetrics = {
  volatility: 0.234,
  sharpeRatio: 1.67,
  maxDrawdown: 0.127,
  valueAtRisk: 0.089,
  conditionalValueAtRisk: 0.142,
  correlationRisk: 0.078
}

export default function MarketAnalysisDashboard() {
  const { connected } = useDLMM()
  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'trends' | 'risk'>('overview')

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600'
      case 'bearish': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
  }

  return (
    <FeatureIdentifier feature={{
      id: 33,
      name: "Market Analysis Dashboard",
      status: "completed",
      sdkLocation: "src/app/demos/market-analysis/page.tsx",
      description: "Comprehensive market intelligence for DLMM pools with real-time analytics, trend analysis, and risk assessment"
    }}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Analysis Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive market intelligence for DLMM pools with real-time analytics, trend analysis, and risk assessment
          </p>
          {!connected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Connect your wallet to access live market data</p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Market Overview' },
              { id: 'pools', label: 'Pool Analytics' },
              { id: 'trends', label: 'Trend Analysis' },
              { id: 'risk', label: 'Risk Assessment' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Value Locked</h3>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(MARKET_METRICS.totalValueLocked)}</p>
                <p className="text-sm text-gray-600 mt-1">Across all DLMM pools</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">24h Volume</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(MARKET_METRICS.volume24h)}</p>
                <p className={`text-sm mt-1 ${getChangeColor(MARKET_METRICS.volumeChange24h)}`}>
                  {formatPercentage(MARKET_METRICS.volumeChange24h)} vs yesterday
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Positions</h3>
                <p className="text-3xl font-bold text-purple-600">{MARKET_METRICS.activePositions.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Positions currently active</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Average APR</h3>
                <p className="text-3xl font-bold text-orange-600">{MARKET_METRICS.averageAPR}%</p>
                <p className="text-sm text-gray-600 mt-1">Weighted by liquidity</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Sentiment</h3>
                <p className={`text-3xl font-bold capitalize ${getSentimentColor(MARKET_METRICS.marketSentiment)}`}>
                  {MARKET_METRICS.marketSentiment}
                </p>
                <p className="text-sm text-gray-600 mt-1">Based on volume &amp; price action</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Health Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Liquidity Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Concentrated (±5%)</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Volume Stability</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Consistency Score</span>
                      <span className="text-sm font-medium text-green-600">82/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pool Analytics Tab */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pool Performance Analytics</h3>
                <p className="text-sm text-gray-600">Detailed metrics for individual DLMM pools</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liquidity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Volume</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {POOL_ANALYTICS.map((pool) => (
                      <tr key={pool.poolId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{pool.pair}</div>
                          <div className="text-sm text-gray-500">{pool.poolId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pool.liquidity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(pool.volume24h)}</div>
                          <div className="text-xs text-gray-500">Fees: {formatCurrency(pool.fees24h)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-orange-600">{pool.apr}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getChangeColor(pool.priceChange24h)}`}>
                            {formatPercentage(pool.priceChange24h)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${pool.binUtilization}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{pool.binUtilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidity Distribution Analysis</h3>
                <div className="space-y-4">
                  {POOL_ANALYTICS.slice(0, 3).map((pool) => (
                    <div key={pool.poolId}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{pool.pair}</span>
                        <span className="text-xs text-gray-500">
                          {pool.liquidityDistribution.concentrated}% concentrated
                        </span>
                      </div>
                      <div className="flex h-3 bg-gray-200 rounded">
                        <div
                          className="bg-blue-600 rounded-l"
                          style={{ width: `${pool.liquidityDistribution.concentrated}%` }}
                        ></div>
                        <div
                          className="bg-blue-400"
                          style={{ width: `${pool.liquidityDistribution.uniform}%` }}
                        ></div>
                        <div
                          className="bg-blue-200 rounded-r"
                          style={{ width: `${pool.liquidityDistribution.edge}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Efficiency Metrics</h3>
                <div className="space-y-4">
                  {POOL_ANALYTICS.slice(0, 3).map((pool) => {
                    const efficiency = (pool.volume24h / pool.liquidity * 100)
                    return (
                      <div key={pool.poolId} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{pool.pair}</div>
                          <div className="text-xs text-gray-500">
                            Volume/Liquidity Ratio
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">{efficiency.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">efficiency</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trend Analysis Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trend (24h)</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      ${TREND_DATA[TREND_DATA.length - 1].price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Current SOL/USDC Price</div>
                    <div className="mt-4 text-xs text-gray-500">
                      Trend: {TREND_DATA[TREND_DATA.length - 1].momentum > 0 ? '↗ Bullish' : '↘ Bearish'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Analysis</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {formatCurrency(TREND_DATA[TREND_DATA.length - 1].volume)}
                    </div>
                    <div className="text-sm text-gray-600">Current Hourly Volume</div>
                    <div className="mt-4 text-xs text-gray-500">
                      Trend: {TREND_DATA[TREND_DATA.length - 1].volume > TREND_DATA[TREND_DATA.length - 2].volume ? '↗ Increasing' : '↘ Decreasing'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {(TREND_DATA[TREND_DATA.length - 1].volatility * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">24h Volatility</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {TREND_DATA[TREND_DATA.length - 1].volatility > 0.2 ? 'High' : 'Normal'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {(TREND_DATA[TREND_DATA.length - 1].momentum * 100).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Momentum Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {TREND_DATA[TREND_DATA.length - 1].momentum > 0 ? 'Bullish' : 'Bearish'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatCurrency(TREND_DATA[TREND_DATA.length - 1].liquidity)}
                  </div>
                  <div className="text-sm text-gray-600">Available Liquidity</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {TREND_DATA[TREND_DATA.length - 1].liquidity > 8000000 ? 'Deep' : 'Shallow'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Signals</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-green-800">Strong Buy Signal</span>
                  </div>
                  <span className="text-sm text-green-600">Volume surge + positive momentum</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="font-medium text-yellow-800">Volatility Alert</span>
                  </div>
                  <span className="text-sm text-yellow-600">Higher than average price swings</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-blue-800">Liquidity Opportunity</span>
                  </div>
                  <span className="text-sm text-blue-600">Good entry point for LP positions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Volatility</h3>
                <p className="text-3xl font-bold text-red-600">{(RISK_METRICS.volatility * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-1">Annualized volatility</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sharpe Ratio</h3>
                <p className="text-3xl font-bold text-green-600">{RISK_METRICS.sharpeRatio}</p>
                <p className="text-sm text-gray-600 mt-1">Risk-adjusted returns</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Max Drawdown</h3>
                <p className="text-3xl font-bold text-orange-600">{(RISK_METRICS.maxDrawdown * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-1">Largest peak-to-trough decline</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Value at Risk (VaR)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">95% VaR (1 day)</span>
                    <span className="font-semibold text-red-600">
                      {(RISK_METRICS.valueAtRisk * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">99% CVaR (1 day)</span>
                    <span className="font-semibold text-red-700">
                      {(RISK_METRICS.conditionalValueAtRisk * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      There is a 5% chance of losing more than {(RISK_METRICS.valueAtRisk * 100).toFixed(2)}% in a single day
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Composition</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Market Risk</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Liquidity Risk</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Correlation Risk</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management Recommendations</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-800">Portfolio Diversification</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Consider spreading positions across uncorrelated assets to reduce concentration risk
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-800">Position Sizing</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Limit individual position size to &lt; 20% of total portfolio to manage single-asset exposure
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-800">Stop-Loss Strategy</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Implement dynamic stop-losses at 15% below entry price to limit downside risk
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-purple-800">Rebalancing Schedule</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Review and rebalance positions weekly or when allocations drift &gt; 25% from targets
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureIdentifier>
  )
}