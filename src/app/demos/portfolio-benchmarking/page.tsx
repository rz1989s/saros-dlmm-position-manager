'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Target, Award, AlertCircle, BarChart3, Activity, Info } from 'lucide-react'
import Link from 'next/link'
import { portfolioBenchmarkingManager, type PortfolioBenchmarkingReport, type BenchmarkType } from '@/lib/dlmm/portfolio-benchmarking'
import { useUserPositions } from '@/hooks/use-dlmm'

export default function PortfolioBenchmarkingDemo() {
  const { publicKey } = useWallet()
  const { positions, loading: positionsLoading } = useUserPositions()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<PortfolioBenchmarkingReport | null>(null)
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-run analysis when positions are loaded
  useEffect(() => {
    if (publicKey && positions && positions.length > 0 && !report && !isAnalyzing) {
      runBenchmarkingAnalysis()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, positions])

  const runBenchmarkingAnalysis = async () => {
    if (!publicKey || !positions || positions.length === 0) {
      setError('No positions found to analyze')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const benchmarkReport = await portfolioBenchmarkingManager.performBenchmarkingAnalysis(
        positions,
        publicKey,
        {
          includePeerAnalysis: true,
          analysisStartDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year
          analysisEndDate: new Date()
        }
      )

      setReport(benchmarkReport)
      if (benchmarkReport.benchmark_comparisons.length > 0) {
        setSelectedBenchmark(benchmarkReport.benchmark_comparisons[0].benchmark_name)
      }
    } catch (err) {
      console.error('Benchmarking analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const selectedComparison = report?.benchmark_comparisons.find(
    c => c.benchmark_name === selectedBenchmark
  )

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'average': return 'text-yellow-400'
      case 'below_average': return 'text-orange-400'
      case 'poor': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRatingBg = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-green-500/10 border-green-500/30'
      case 'good': return 'bg-blue-500/10 border-blue-500/30'
      case 'average': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'below_average': return 'bg-orange-500/10 border-orange-500/30'
      case 'poor': return 'bg-red-500/10 border-red-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const getBenchmarkIcon = (type: BenchmarkType) => {
    switch (type) {
      case 'market_index': return <TrendingUp className="w-4 h-4" />
      case 'peer_group': return <Award className="w-4 h-4" />
      case 'custom_index': return <Target className="w-4 h-4" />
      case 'hold_strategy': return <Activity className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/demos"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Demos</span>
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <h1 className="text-xl font-bold text-white">Portfolio Benchmarking</h1>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Feature Description */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">
                  Feature #58: Portfolio Performance Benchmarking
                </h2>
                <p className="text-gray-300 mb-4">
                  Compare your portfolio performance against market indices, peer groups, and custom benchmarks.
                  Get detailed analysis of relative returns, risk-adjusted metrics, and actionable recommendations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300 border border-purple-500/30">
                    Multi-Benchmark Comparison
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-sm text-blue-300 border border-blue-500/30">
                    Peer Group Analysis
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-sm text-green-300 border border-green-500/30">
                    Risk-Adjusted Metrics
                  </span>
                  <span className="px-3 py-1 bg-yellow-500/20 rounded-full text-sm text-yellow-300 border border-yellow-500/30">
                    Relative Performance
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection Required */}
          {!publicKey && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Wallet Connection Required</h3>
              <p className="text-gray-300 mb-4">
                Please connect your wallet to analyze your portfolio performance against benchmarks.
              </p>
              <WalletMultiButton />
            </div>
          )}

          {/* Loading State */}
          {publicKey && (positionsLoading || isAnalyzing) && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                <span className="text-gray-300">
                  {positionsLoading ? 'Loading positions...' : 'Running benchmarking analysis...'}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Comparing against market indices, peer groups, and calculating metrics...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Analysis Error</h3>
                  <p className="text-gray-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Benchmarking Report */}
          {report && (
            <>
              {/* Overall Assessment */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-6 border ${getRatingBg(report.relative_performance.overall_assessment.rating)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Overall Performance Rating</h3>
                    <p className="text-gray-300">
                      Based on {report.benchmark_comparisons.length} benchmark comparisons
                    </p>
                  </div>
                  <div className={`text-5xl font-bold ${getRatingColor(report.relative_performance.overall_assessment.rating)}`}>
                    {report.relative_performance.overall_assessment.rating.toUpperCase()}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {/* Key Strengths */}
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {report.relative_performance.overall_assessment.key_strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                      {report.relative_performance.overall_assessment.key_strengths.length === 0 && (
                        <li className="text-sm text-gray-400 italic">No significant strengths identified</li>
                      )}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {report.relative_performance.overall_assessment.areas_for_improvement.map((area, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">›</span>
                          <span>{area}</span>
                        </li>
                      ))}
                      {report.relative_performance.overall_assessment.areas_for_improvement.length === 0 && (
                        <li className="text-sm text-gray-400 italic">No critical areas identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Benchmark Selector and Comparison */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Benchmark List */}
                <div className="lg:col-span-1">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Benchmarks</h3>
                    <div className="space-y-2">
                      {report.benchmark_comparisons.map((comparison) => (
                        <button
                          key={comparison.benchmark_name}
                          onClick={() => setSelectedBenchmark(comparison.benchmark_name)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedBenchmark === comparison.benchmark_name
                              ? 'bg-purple-500/20 border border-purple-500/50'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {getBenchmarkIcon(comparison.benchmark_type)}
                              <span className="text-sm font-medium text-white">
                                {comparison.benchmark_name}
                              </span>
                            </div>
                            {comparison.performance_comparison.outperformance && (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {comparison.performance_comparison.outperformance ? '+' : ''}
                            {(comparison.performance_comparison.excess_return * 100).toFixed(2)}% excess return
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detailed Comparison */}
                <div className="lg:col-span-2">
                  {selectedComparison && (
                    <motion.div
                      key={selectedComparison.benchmark_name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Performance Comparison */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Performance Comparison</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Portfolio Return</div>
                            <div className="text-2xl font-bold text-white">
                              {(selectedComparison.performance_comparison.portfolio_return * 100).toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Benchmark Return</div>
                            <div className="text-2xl font-bold text-white">
                              {(selectedComparison.performance_comparison.benchmark_return * 100).toFixed(2)}%
                            </div>
                          </div>
                          <div className={`rounded-lg p-4 border ${
                            selectedComparison.performance_comparison.outperformance
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-red-500/10 border-red-500/30'
                          }`}>
                            <div className="text-sm text-gray-300 mb-1">Excess Return</div>
                            <div className={`text-2xl font-bold ${
                              selectedComparison.performance_comparison.outperformance
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {selectedComparison.performance_comparison.outperformance ? '+' : ''}
                              {(selectedComparison.performance_comparison.excess_return * 100).toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Information Ratio</div>
                            <div className="text-2xl font-bold text-white">
                              {selectedComparison.correlation_metrics.information_ratio.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Risk Metrics */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Risk-Adjusted Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Portfolio Sharpe</div>
                              <div className="text-lg font-semibold text-white">
                                {selectedComparison.risk_comparison.portfolio_sharpe.toFixed(3)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Portfolio Volatility</div>
                              <div className="text-lg font-semibold text-white">
                                {(selectedComparison.risk_comparison.portfolio_volatility * 100).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Benchmark Sharpe</div>
                              <div className="text-lg font-semibold text-white">
                                {selectedComparison.risk_comparison.benchmark_sharpe.toFixed(3)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Benchmark Volatility</div>
                              <div className="text-lg font-semibold text-white">
                                {(selectedComparison.risk_comparison.benchmark_volatility * 100).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Correlation Metrics */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Correlation & Beta Analysis</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Beta</div>
                            <div className="text-xl font-bold text-white">
                              {selectedComparison.correlation_metrics.beta.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Alpha</div>
                            <div className="text-xl font-bold text-white">
                              {(selectedComparison.correlation_metrics.alpha * 100).toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">R²</div>
                            <div className="text-xl font-bold text-white">
                              {(selectedComparison.correlation_metrics.r_squared * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Capture Ratios */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Capture Ratios</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-300 mb-1">Upside Capture</div>
                            <div className="text-xl font-bold text-green-400">
                              {(selectedComparison.capture_ratios.upside_capture * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-300 mb-1">Downside Capture</div>
                            <div className="text-xl font-bold text-red-400">
                              {(selectedComparison.capture_ratios.downside_capture * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-300 mb-1">Capture Ratio</div>
                            <div className="text-xl font-bold text-blue-400">
                              {selectedComparison.capture_ratios.capture_ratio.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                            <p className="text-xs text-gray-300">
                              Capture ratios measure your portfolio&apos;s participation in upward and downward market movements.
                              Higher upside capture and lower downside capture indicate superior risk-adjusted performance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Peer Group Analysis */}
              {report.peer_group_analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Peer Group Analysis</h3>
                  <div className="mb-4">
                    <p className="text-gray-300">
                      {report.peer_group_analysis.peer_group_name} - Universe of {report.peer_group_analysis.universe_size} strategies
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Overall Rank</div>
                      <div className="text-2xl font-bold text-white">
                        #{report.peer_group_analysis.portfolio_rankings.overall_rank}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        of {report.peer_group_analysis.universe_size} strategies
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Return Percentile</div>
                      <div className="text-2xl font-bold text-white">
                        {report.peer_group_analysis.portfolio_rankings.return_percentile.toFixed(0)}th
                      </div>
                      <div className="text-xs text-gray-400 mt-1">percentile</div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Sharpe Percentile</div>
                      <div className="text-2xl font-bold text-white">
                        {report.peer_group_analysis.portfolio_rankings.sharpe_percentile.toFixed(0)}th
                      </div>
                      <div className="text-xs text-gray-400 mt-1">percentile</div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Quartile</div>
                      <div className="text-2xl font-bold text-white">
                        Q{report.peer_group_analysis.relative_positioning.quartile}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {report.peer_group_analysis.relative_positioning.above_median ? 'Above' : 'Below'} median
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {report.recommendations.map((recommendation, idx) => (
                    <div
                      key={idx}
                      className="bg-black/20 rounded-lg p-4 border border-white/10"
                    >
                      <p className="text-gray-200">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Analysis Metadata */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-400">
                    Analysis Period: {report.portfolio_summary.analysis_period.start.toLocaleDateString()} - {report.portfolio_summary.analysis_period.end.toLocaleDateString()}
                  </div>
                  <div className="text-gray-400">
                    Generated: {report.generated_at.toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
