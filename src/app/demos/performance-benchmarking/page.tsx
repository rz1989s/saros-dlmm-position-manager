'use client'

import React, { useState } from 'react'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { useDLMM } from '@/hooks/use-dlmm'

// Performance Benchmarking Types
interface BenchmarkMetrics {
  portfolioReturn: number
  benchmarkReturn: number
  alpha: number
  beta: number
  sharpeRatio: number
  informationRatio: number
  trackingError: number
  maxDrawdown: number
  volatility: number
}

interface PerformancePeriod {
  period: string
  portfolioReturn: number
  benchmarkReturn: number
  excessReturn: number
  rankPercentile: number
}

interface AttributionData {
  factor: string
  contribution: number
  weight: number
  returnContribution: number
  selection: number
  allocation: number
}

interface RiskMetrics {
  valueAtRisk: number
  conditionalVaR: number
  beta: number
  correlationWithMarket: number
  downsideDeviation: number
  upsideCapture: number
  downsideCapture: number
}

// Mock Data
const BENCHMARK_METRICS: BenchmarkMetrics = {
  portfolioReturn: 24.7,
  benchmarkReturn: 18.3,
  alpha: 6.4,
  beta: 1.12,
  sharpeRatio: 1.68,
  informationRatio: 0.94,
  trackingError: 6.8,
  maxDrawdown: 12.3,
  volatility: 14.6
}

const PERFORMANCE_PERIODS: PerformancePeriod[] = [
  {
    period: '1 Month',
    portfolioReturn: 8.2,
    benchmarkReturn: 5.1,
    excessReturn: 3.1,
    rankPercentile: 15
  },
  {
    period: '3 Months',
    portfolioReturn: 12.8,
    benchmarkReturn: 9.4,
    excessReturn: 3.4,
    rankPercentile: 22
  },
  {
    period: '6 Months',
    portfolioReturn: 18.9,
    benchmarkReturn: 14.2,
    excessReturn: 4.7,
    rankPercentile: 18
  },
  {
    period: '1 Year',
    portfolioReturn: 24.7,
    benchmarkReturn: 18.3,
    excessReturn: 6.4,
    rankPercentile: 12
  },
  {
    period: '3 Years',
    portfolioReturn: 68.4,
    benchmarkReturn: 52.1,
    excessReturn: 16.3,
    rankPercentile: 8
  }
]

const ATTRIBUTION_DATA: AttributionData[] = [
  {
    factor: 'Asset Selection',
    contribution: 4.2,
    weight: 0.65,
    returnContribution: 6.46,
    selection: 4.2,
    allocation: 0.0
  },
  {
    factor: 'Sector Allocation',
    contribution: 1.8,
    weight: 0.35,
    returnContribution: 0.63,
    selection: 0.0,
    allocation: 1.8
  },
  {
    factor: 'Currency Effects',
    contribution: 0.3,
    weight: 0.12,
    returnContribution: 0.04,
    selection: 0.2,
    allocation: 0.1
  },
  {
    factor: 'Timing Effects',
    contribution: 0.8,
    weight: 1.0,
    returnContribution: 0.8,
    selection: 0.8,
    allocation: 0.0
  }
]

const RISK_METRICS: RiskMetrics = {
  valueAtRisk: 8.7,
  conditionalVaR: 12.4,
  beta: 1.12,
  correlationWithMarket: 0.78,
  downsideDeviation: 9.8,
  upsideCapture: 115.3,
  downsideCapture: 87.2
}

export default function PerformanceBenchmarkingDemo() {
  const { connected } = useDLMM()
  const [activeTab, setActiveTab] = useState<'overview' | 'attribution' | 'risk' | 'comparison'>('overview')

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals)
  }

  const getPerformanceColor = (value: number) => {
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const getRankColor = (percentile: number) => {
    if (percentile <= 25) return 'text-green-600 bg-green-50'
    if (percentile <= 50) return 'text-blue-600 bg-blue-50'
    if (percentile <= 75) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getRankLabel = (percentile: number) => {
    if (percentile <= 25) return 'Top Quartile'
    if (percentile <= 50) return 'Above Median'
    if (percentile <= 75) return 'Below Median'
    return 'Bottom Quartile'
  }

  return (
    <FeatureIdentifier feature={{
      id: 34,
      name: "Performance Benchmarking",
      status: "completed",
      sdkLocation: "src/app/demos/performance-benchmarking/page.tsx",
      description: "Comprehensive performance analysis, risk-adjusted returns, and benchmarking against market indices"
    }}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Benchmarking</h1>
          <p className="text-gray-600">
            Comprehensive performance analysis with risk-adjusted returns, attribution analysis, and peer comparison
          </p>
          {!connected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Connect your wallet to access live performance data</p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Performance Overview' },
              { id: 'attribution', label: 'Return Attribution' },
              { id: 'risk', label: 'Risk Analysis' },
              { id: 'comparison', label: 'Peer Comparison' }
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

        {/* Performance Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Return</h3>
                <p className="text-3xl font-bold text-green-600">{formatPercentage(BENCHMARK_METRICS.portfolioReturn)}</p>
                <p className="text-sm text-gray-600 mt-1">1 Year Annualized</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Benchmark Return</h3>
                <p className="text-3xl font-bold text-blue-600">{formatPercentage(BENCHMARK_METRICS.benchmarkReturn)}</p>
                <p className="text-sm text-gray-600 mt-1">1 Year Annualized</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Alpha</h3>
                <p className="text-3xl font-bold text-purple-600">{formatPercentage(BENCHMARK_METRICS.alpha)}</p>
                <p className="text-sm text-gray-600 mt-1">Excess return vs risk</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sharpe Ratio</h3>
                <p className="text-3xl font-bold text-orange-600">{formatNumber(BENCHMARK_METRICS.sharpeRatio)}</p>
                <p className="text-sm text-gray-600 mt-1">Risk-adjusted returns</p>
              </div>
            </div>

            {/* Performance Periods Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance by Time Period</h3>
                <p className="text-sm text-gray-600">Returns and rankings across different timeframes</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benchmark</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Excess Return</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {PERFORMANCE_PERIODS.map((period, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {period.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPerformanceColor(period.portfolioReturn)}`}>
                            {formatPercentage(period.portfolioReturn)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPerformanceColor(period.benchmarkReturn)}`}>
                            {formatPercentage(period.benchmarkReturn)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPerformanceColor(period.excessReturn)}`}>
                            {formatPercentage(period.excessReturn)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getRankColor(period.rankPercentile)}`}>
                            {period.rankPercentile}th ({getRankLabel(period.rankPercentile)})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beta</span>
                    <span className="font-medium">{formatNumber(BENCHMARK_METRICS.beta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Error</span>
                    <span className="font-medium">{formatPercentage(BENCHMARK_METRICS.trackingError)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drawdown</span>
                    <span className="font-medium text-red-600">{formatPercentage(-BENCHMARK_METRICS.maxDrawdown)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatility</span>
                    <span className="font-medium">{formatPercentage(BENCHMARK_METRICS.volatility)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk-Adjusted Returns</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sharpe Ratio</span>
                    <span className="font-medium text-green-600">{formatNumber(BENCHMARK_METRICS.sharpeRatio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Information Ratio</span>
                    <span className="font-medium text-blue-600">{formatNumber(BENCHMARK_METRICS.informationRatio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alpha</span>
                    <span className="font-medium text-purple-600">{formatPercentage(BENCHMARK_METRICS.alpha)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Excess Return</span>
                    <span className="font-medium text-orange-600">
                      {formatPercentage(BENCHMARK_METRICS.portfolioReturn - BENCHMARK_METRICS.benchmarkReturn)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Attribution Tab */}
        {activeTab === 'attribution' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Return Attribution Analysis</h3>
                <p className="text-sm text-gray-600">Breakdown of performance sources and drivers</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Contribution</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection Effect</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation Effect</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ATTRIBUTION_DATA.map((factor, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {factor.factor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPerformanceColor(factor.contribution)}`}>
                            {formatPercentage(factor.contribution)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPerformanceColor(factor.selection)}`}>
                            {formatPercentage(factor.selection)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPerformanceColor(factor.allocation)}`}>
                            {formatPercentage(factor.allocation)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {formatPercentage(factor.weight * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attribution Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Top Contributors</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Asset Selection</span>
                        <span className="font-medium text-green-800">+4.2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Sector Allocation</span>
                        <span className="font-medium text-green-800">+1.8%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Performance Drivers</h4>
                    <div className="text-sm text-blue-700">
                      <p>Strong security selection in growth sectors (+4.2%)</p>
                      <p>Optimal sector allocation timing (+1.8%)</p>
                      <p>Tactical positioning benefits (+0.8%)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Decomposition</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Selection Effect</span>
                      <span className="text-sm font-medium">+5.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '81%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Allocation Effect</span>
                      <span className="text-sm font-medium">+1.9%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Interaction Effect</span>
                      <span className="text-sm font-medium">-0.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '11%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Analysis Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Value at Risk</h3>
                <p className="text-3xl font-bold text-red-600">{formatPercentage(RISK_METRICS.valueAtRisk)}</p>
                <p className="text-sm text-gray-600 mt-1">95% confidence, 1 day</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Beta</h3>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(RISK_METRICS.beta)}</p>
                <p className="text-sm text-gray-600 mt-1">Market sensitivity</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Correlation</h3>
                <p className="text-3xl font-bold text-purple-600">{formatNumber(RISK_METRICS.correlationWithMarket)}</p>
                <p className="text-sm text-gray-600 mt-1">With market benchmark</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Downside Risk Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conditional VaR (99%)</span>
                    <span className="font-medium text-red-600">{formatPercentage(RISK_METRICS.conditionalVaR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downside Deviation</span>
                    <span className="font-medium">{formatPercentage(RISK_METRICS.downsideDeviation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downside Capture</span>
                    <span className="font-medium text-green-600">{formatPercentage(RISK_METRICS.downsideCapture)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drawdown</span>
                    <span className="font-medium text-red-600">{formatPercentage(-BENCHMARK_METRICS.maxDrawdown)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upside Potential</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upside Capture</span>
                    <span className="font-medium text-green-600">{formatPercentage(RISK_METRICS.upsideCapture)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatility</span>
                    <span className="font-medium">{formatPercentage(BENCHMARK_METRICS.volatility)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Error</span>
                    <span className="font-medium">{formatPercentage(BENCHMARK_METRICS.trackingError)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Information Ratio</span>
                    <span className="font-medium text-blue-600">{formatNumber(BENCHMARK_METRICS.informationRatio)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium text-green-800">Low Downside Risk</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      87% downside capture vs 115% upside capture indicates good downside protection
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium text-blue-800">Moderate Beta</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Beta of 1.12 indicates slightly higher volatility than market
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-medium text-yellow-800">Tracking Risk</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      6.8% tracking error suggests active management with controlled risk
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="font-medium text-purple-800">Strong Correlation</span>
                    </div>
                    <p className="text-sm text-purple-700 mt-1">
                      0.78 correlation with market provides diversification benefits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Peer Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Peer Universe Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">12th</div>
                  <div className="text-sm text-gray-600">Percentile Rank</div>
                  <div className="text-xs text-gray-500 mt-1">Top Quartile Performance</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">247</div>
                  <div className="text-sm text-gray-600">Peer Universe Size</div>
                  <div className="text-xs text-gray-500 mt-1">Similar risk/strategy funds</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">+6.4%</div>
                  <div className="text-sm text-gray-600">vs Peer Median</div>
                  <div className="text-xs text-gray-500 mt-1">Outperformance margin</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Ranking</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">1 Year Return</div>
                      <div className="text-sm text-green-600">vs 247 peers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">12th %ile</div>
                      <div className="text-sm text-green-600">Top Quartile</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-800">Risk-Adjusted Return</div>
                      <div className="text-sm text-blue-600">Sharpe ratio ranking</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-700">8th %ile</div>
                      <div className="text-sm text-blue-600">Top Decile</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-800">Downside Protection</div>
                      <div className="text-sm text-yellow-600">Max drawdown ranking</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-700">25th %ile</div>
                      <div className="text-sm text-yellow-600">First Quartile</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Peer Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Return vs Peer Median</span>
                      <span className="text-sm font-medium text-green-600">+6.4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Risk vs Peer Median</span>
                      <span className="text-sm font-medium text-blue-600">+2.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Alpha vs Peers</span>
                      <span className="text-sm font-medium text-purple-600">+4.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Positioning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Strengths</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700">Superior risk-adjusted returns (Top 10%)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700">Consistent outperformance across timeframes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700">Strong downside protection (Top 25%)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700">Excellent alpha generation (+6.4%)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Areas for Improvement</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-yellow-700">Moderate tracking error vs peers</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-yellow-700">Slightly higher beta than peer median</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-yellow-700">Concentration risk in growth sectors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureIdentifier>
  )
}