'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { formatCurrency } from '@/lib/utils/format'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle,
  Shield,
  BarChart3,
  Target,
  Layers
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface RiskDecomposition {
  factor: string
  contribution: number
  variance: number
  correlation: number
}

interface SectorAllocation {
  sector: string
  value: number
  percentage: number
  positions: number
  pnl: number
}

interface PerformanceAttribution {
  asset: string
  allocation: number
  returns: number
  contribution: number
  alpha: number
  beta: number
}

interface CorrelationPair {
  asset1: string
  asset2: string
  correlation: number
  strength: 'strong' | 'moderate' | 'weak'
}

export default function AdvancedPortfolioAnalyticsDemo() {
  const [selectedTab, setSelectedTab] = useState('risk')
  const portfolioValue = 125480
  const totalPositions = 8

  const riskDecomposition: RiskDecomposition[] = [
    { factor: 'Market Risk', contribution: 42.3, variance: 0.0234, correlation: 0.85 },
    { factor: 'Liquidity Risk', contribution: 18.7, variance: 0.0089, correlation: 0.62 },
    { factor: 'Impermanent Loss', contribution: 15.2, variance: 0.0067, correlation: 0.54 },
    { factor: 'Smart Contract', contribution: 8.9, variance: 0.0032, correlation: 0.28 },
    { factor: 'Oracle Risk', contribution: 7.4, variance: 0.0021, correlation: 0.41 },
    { factor: 'Counterparty Risk', contribution: 4.8, variance: 0.0015, correlation: 0.33 },
    { factor: 'Operational Risk', contribution: 2.7, variance: 0.0008, correlation: 0.19 }
  ]

  const sectorAllocation: SectorAllocation[] = [
    { sector: 'Stablecoins', value: 45820, percentage: 36.5, positions: 3, pnl: 2140 },
    { sector: 'DeFi Blue Chips', value: 38200, percentage: 30.4, positions: 2, pnl: 5780 },
    { sector: 'Layer 1', value: 28340, percentage: 22.6, positions: 2, pnl: -1230 },
    { sector: 'Meme Tokens', value: 8950, percentage: 7.1, positions: 1, pnl: 3450 },
    { sector: 'Gaming/NFT', value: 4170, percentage: 3.4, positions: 0, pnl: -890 }
  ]

  const performanceAttribution: PerformanceAttribution[] = [
    { asset: 'SOL-USDC', allocation: 28.5, returns: 12.4, contribution: 3.53, alpha: 2.8, beta: 1.15 },
    { asset: 'BONK-SOL', allocation: 18.2, returns: 45.7, contribution: 8.32, alpha: 38.2, beta: 1.82 },
    { asset: 'JUP-USDC', allocation: 15.7, returns: 8.9, contribution: 1.40, alpha: 1.2, beta: 0.95 },
    { asset: 'USDC-USDT', allocation: 22.3, returns: 2.1, contribution: 0.47, alpha: 1.8, beta: 0.12 },
    { asset: 'RAY-SOL', allocation: 9.8, returns: -5.2, contribution: -0.51, alpha: -8.7, beta: 1.34 },
    { asset: 'ORCA-USDC', allocation: 5.5, returns: 15.8, contribution: 0.87, alpha: 9.2, beta: 1.08 }
  ]

  const correlationMatrix: CorrelationPair[] = [
    { asset1: 'SOL-USDC', asset2: 'BONK-SOL', correlation: 0.78, strength: 'strong' },
    { asset1: 'SOL-USDC', asset2: 'JUP-USDC', correlation: 0.65, strength: 'moderate' },
    { asset1: 'SOL-USDC', asset2: 'RAY-SOL', correlation: 0.82, strength: 'strong' },
    { asset1: 'BONK-SOL', asset2: 'JUP-USDC', correlation: 0.43, strength: 'moderate' },
    { asset1: 'BONK-SOL', asset2: 'USDC-USDT', correlation: 0.09, strength: 'weak' },
    { asset1: 'JUP-USDC', asset2: 'USDC-USDT', correlation: 0.15, strength: 'weak' },
    { asset1: 'USDC-USDT', asset2: 'RAY-SOL', correlation: 0.11, strength: 'weak' }
  ]

  const riskRadarData = [
    { metric: 'Volatility', value: 72, max: 100 },
    { metric: 'Concentration', value: 45, max: 100 },
    { metric: 'Liquidity', value: 88, max: 100 },
    { metric: 'Diversification', value: 62, max: 100 },
    { metric: 'IL Exposure', value: 38, max: 100 }
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[27] || { id: 27, name: 'Advanced Portfolio Analytics', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Advanced Analytics</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Advanced Portfolio Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive portfolio analysis with risk decomposition, sector allocation, performance attribution, and correlation matrices
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #27
            </Badge>
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
              <TrendingUp className="h-3 w-3" />
              Multi-Dimensional
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">Across {totalPositions} positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatCurrency(9250)}
            </div>
            <p className="text-xs text-muted-foreground">+7.9% return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">6.8/10</div>
            <p className="text-xs text-muted-foreground">Moderate-High</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1.84</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk">Risk Decomposition</TabsTrigger>
          <TabsTrigger value="sector">Sector Allocation</TabsTrigger>
          <TabsTrigger value="attribution">Performance Attribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
        </TabsList>

        {/* Risk Decomposition Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Risk Factor Contribution
                </CardTitle>
                <CardDescription>Portfolio risk breakdown by factor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={riskDecomposition} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="factor" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="contribution" fill="#ef4444" name="Contribution %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Risk Profile Radar
                </CardTitle>
                <CardDescription>Multi-dimensional risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={riskRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Risk Level"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Factor Details</CardTitle>
              <CardDescription>Comprehensive risk metrics and correlations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskDecomposition.map((risk, index) => (
                  <motion.div
                    key={risk.factor}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{risk.factor}</h4>
                      <Badge variant="secondary">{risk.contribution.toFixed(1)}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Variance</span>
                        <div className="font-medium">{risk.variance.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Correlation</span>
                        <div className="font-medium">{risk.correlation.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contribution</span>
                        <div className="font-medium text-red-600">{risk.contribution.toFixed(1)}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sector Allocation Tab */}
        <TabsContent value="sector" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Sector Distribution
                </CardTitle>
                <CardDescription>Portfolio allocation by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sectorAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sector, percentage }) => `${sector}: ${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorAllocation.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-green-600" />
                  Sector P&L Performance
                </CardTitle>
                <CardDescription>Profit/loss by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sectorAllocation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="pnl" fill="#10b981">
                      {sectorAllocation.map((sector) => (
                        <Cell
                          key={sector.sector}
                          fill={sector.pnl >= 0 ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sector Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectorAllocation.map((sector, index) => (
                  <motion.div
                    key={sector.sector}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{sector.sector}</h4>
                      <Badge variant={sector.pnl >= 0 ? "default" : "destructive"}>
                        {sector.pnl >= 0 ? '+' : ''}{formatCurrency(sector.pnl)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Value</span>
                        <div className="font-medium">{formatCurrency(sector.value)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Allocation</span>
                        <div className="font-medium">{sector.percentage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Positions</span>
                        <div className="font-medium">{sector.positions}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Return</span>
                        <div className={`font-medium ${sector.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {((sector.pnl / sector.value) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Attribution Tab */}
        <TabsContent value="attribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Asset Performance Contribution
              </CardTitle>
              <CardDescription>Individual asset contribution to portfolio returns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={performanceAttribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="contribution" fill="#10b981" name="Contribution %" />
                  <Bar dataKey="alpha" fill="#3b82f6" name="Alpha %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Attribution Analysis</CardTitle>
              <CardDescription>Detailed performance breakdown by asset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceAttribution.map((asset, index) => (
                  <motion.div
                    key={asset.asset}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-mono text-sm font-medium">{asset.asset}</h4>
                      <Badge variant={asset.contribution >= 0 ? "default" : "destructive"}>
                        {asset.contribution >= 0 ? '+' : ''}{asset.contribution.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Allocation</span>
                        <div className="font-medium">{asset.allocation.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Returns</span>
                        <div className={`font-medium ${asset.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.returns.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Alpha</span>
                        <div className={`font-medium ${asset.alpha >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {asset.alpha.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Beta</span>
                        <div className="font-medium">{asset.beta.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contribution</span>
                        <div className={`font-medium ${asset.contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.contribution.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlation Analysis Tab */}
        <TabsContent value="correlation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Asset Correlation Matrix
              </CardTitle>
              <CardDescription>Correlation strength between portfolio assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {correlationMatrix.map((pair, index) => (
                  <motion.div
                    key={`${pair.asset1}-${pair.asset2}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm">{pair.asset1}</span>
                          <span className="text-muted-foreground">↔</span>
                          <span className="font-mono text-sm">{pair.asset2}</span>
                          <Badge
                            variant={
                              pair.strength === 'strong'
                                ? 'destructive'
                                : pair.strength === 'moderate'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {pair.strength}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                pair.strength === 'strong'
                                  ? 'bg-red-500'
                                  : pair.strength === 'moderate'
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.abs(pair.correlation) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium min-w-[50px] text-right">
                            {pair.correlation.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.43</div>
                <p className="text-xs text-muted-foreground">Moderate diversification</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Highest Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">0.82</div>
                <p className="text-xs text-muted-foreground">SOL-USDC ↔ RAY-SOL</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Lowest Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">0.09</div>
                <p className="text-xs text-muted-foreground">BONK-SOL ↔ USDC-USDT</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Details */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="h-5 w-5" />
            Advanced Analytics Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Risk Decomposition:</strong> Multi-factor risk analysis with variance and correlation metrics</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Sector Allocation:</strong> Comprehensive sector analysis with P&L tracking and position counts</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Performance Attribution:</strong> Alpha/beta analysis with contribution decomposition</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Correlation Matrix:</strong> Cross-asset correlation analysis for diversification optimization</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Real-Time Updates:</strong> Live portfolio analytics with automatic recalculation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
