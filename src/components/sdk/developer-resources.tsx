'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Book,
  Code,
  Download,
  ExternalLink,
  Github,
  FileText,
  Play,
  Copy,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Zap,
  Target,
  Rocket,
  Users,
  MessageCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { StaggerList } from '@/components/animations/stagger-list'

interface QuickStartStep {
  title: string
  description: string
  code?: string
  commands?: string[]
  notes?: string[]
}

interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  skills: string[]
  steps: QuickStartStep[]
}

interface CodeSnippet {
  id: string
  title: string
  description: string
  category: 'setup' | 'positions' | 'analytics' | 'advanced'
  complexity: 'basic' | 'intermediate' | 'advanced'
  code: string
  usage: string
  benefits: string[]
}

const QUICK_START_STEPS: QuickStartStep[] = [
  {
    title: 'Install Dependencies',
    description: 'Add the Saros DLMM SDK and required dependencies to your project',
    commands: [
      'npm install @saros-finance/dlmm-sdk @solana/web3.js @solana/wallet-adapter-react',
      'npm install -D typescript @types/node'
    ],
    notes: [
      'SDK requires Node.js 16+ and TypeScript for full type safety',
      'Wallet adapter provides seamless Solana wallet integration'
    ]
  },
  {
    title: 'Configure Environment',
    description: 'Set up your environment variables and RPC endpoints',
    code: `# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Optional: Premium RPC for better performance
# NEXT_PUBLIC_RPC_ENDPOINT=https://your-premium-rpc-endpoint.com`,
    notes: [
      'Use mainnet-beta for production, devnet for development',
      'Premium RPC endpoints recommended for production apps'
    ]
  },
  {
    title: 'Initialize DLMM Client',
    description: 'Create and configure your DLMM client with enhanced features',
    code: `import { LiquidityBookServices } from '@saros-finance/dlmm-sdk'
import { Connection } from '@solana/web3.js'

// Enhanced client with caching
export class EnhancedDLMMClient {
  private liquidityBookServices: LiquidityBookServices
  private cache = new Map<string, any>()

  constructor() {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
      { commitment: 'confirmed' }
    )

    this.liquidityBookServices = new LiquidityBookServices(connection)
  }

  async getLbPairs() {
    const cacheKey = 'all-pairs'
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data
    }

    const pairs = await this.liquidityBookServices.getAllLbPairs()
    this.cache.set(cacheKey, { data: pairs, timestamp: Date.now() })

    return pairs
  }
}

export const dlmmClient = new EnhancedDLMMClient()`,
    notes: [
      'Caching reduces RPC calls and improves performance',
      'Use confirmed commitment for balance between speed and finality'
    ]
  },
  {
    title: 'First API Call',
    description: 'Make your first SDK call to load position data',
    code: `import { dlmmClient } from './dlmm-client'
import { useWallet } from '@solana/wallet-adapter-react'

export function useUserPositions() {
  const { publicKey } = useWallet()
  const [positions, setPositions] = useState([])

  useEffect(() => {
    if (!publicKey) return

    const loadPositions = async () => {
      try {
        const userPositions = await dlmmClient.getUserPositions({
          userPubkey: publicKey
        })
        setPositions(userPositions)
      } catch (error) {
        console.error('Failed to load positions:', error)
      }
    }

    loadPositions()
  }, [publicKey])

  return positions
}`,
    notes: [
      'Hook pattern provides clean separation of concerns',
      'Error handling ensures graceful failures'
    ]
  },
  {
    title: 'Add Real-time Updates',
    description: 'Implement real-time position tracking with intelligent polling',
    code: `export function useRealTimePositions() {
  const { publicKey } = useWallet()
  const [positions, setPositions] = useState([])
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    if (!publicKey) return

    const interval = setInterval(async () => {
      try {
        const userPositions = await dlmmClient.getUserPositions({
          userPubkey: publicKey
        })
        setPositions(userPositions)
        setLastUpdate(Date.now())
      } catch (error) {
        console.error('Real-time update failed:', error)
      }
    }, 30000) // 30-second polling

    return () => clearInterval(interval)
  }, [publicKey])

  return { positions, lastUpdate }
}`,
    notes: [
      '30-second polling balances freshness with RPC usage',
      'Cleanup interval prevents memory leaks'
    ]
  }
]

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'beginner',
    title: 'DLMM Fundamentals',
    description: 'Learn the basics of DLMM and SDK integration',
    difficulty: 'beginner',
    duration: '2-3 hours',
    skills: ['SDK Setup', 'Basic API Calls', 'Position Loading', 'Error Handling'],
    steps: QUICK_START_STEPS.slice(0, 3)
  },
  {
    id: 'intermediate',
    title: 'Advanced Position Management',
    description: 'Build sophisticated position tracking and analytics',
    difficulty: 'intermediate',
    duration: '4-6 hours',
    skills: ['Real-time Updates', 'Caching Strategies', 'Performance Optimization', 'Analytics'],
    steps: QUICK_START_STEPS
  },
  {
    id: 'advanced',
    title: 'Enterprise Integration',
    description: 'Production-ready implementation with advanced features',
    difficulty: 'advanced',
    duration: '8-12 hours',
    skills: ['Architecture Design', 'Testing', 'Monitoring', 'Advanced Features'],
    steps: [...QUICK_START_STEPS, {
      title: 'Advanced Features',
      description: 'Implement backtesting, arbitrage detection, and predictive caching',
      code: `// Advanced feature integration
import { BacktestEngine } from './backtesting'
import { ArbitrageManager } from './arbitrage'
import { PredictiveCacheManager } from './cache'

export class AdvancedDLMMClient extends EnhancedDLMMClient {
  private backtestEngine = new BacktestEngine()
  private arbitrageManager = new ArbitrageManager()
  private predictiveCache = new PredictiveCacheManager()

  async runBacktest(strategy: Strategy) {
    return await this.backtestEngine.run(strategy)
  }

  async detectArbitrageOpportunities() {
    return await this.arbitrageManager.scan()
  }
}`,
      notes: [
        'Modular architecture allows incremental feature adoption',
        'Each advanced feature can be integrated independently'
      ]
    }]
  }
]

const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'position-analytics',
    title: 'Position Analytics Calculator',
    description: 'Calculate comprehensive position metrics including P&L, APR, and IL',
    category: 'analytics',
    complexity: 'intermediate',
    code: `export class PositionAnalytics {
  static async calculateMetrics(position: PositionInfo): Promise<PositionMetrics> {
    // Get current token prices
    const tokenXPrice = await oracleManager.getPrice(position.tokenX)
    const tokenYPrice = await oracleManager.getPrice(position.tokenY)

    // Calculate current position value
    const currentValue = (position.tokenXAmount * tokenXPrice) +
                        (position.tokenYAmount * tokenYPrice)

    // Calculate unrealized P&L
    const unrealizedPnL = currentValue - position.initialValue

    // Calculate fees earned
    const feesEarned = position.feeX + position.feeY

    // Calculate APR based on time held
    const daysSinceCreation = (Date.now() - position.createdAt) / (1000 * 60 * 60 * 24)
    const apr = ((feesEarned + unrealizedPnL) / position.initialValue) * (365 / daysSinceCreation) * 100

    return {
      currentValue,
      unrealizedPnL,
      feesEarned,
      apr,
      impermanentLoss: this.calculateIL(position, tokenXPrice, tokenYPrice)
    }
  }

  private static calculateIL(position: PositionInfo, currentXPrice: number, currentYPrice: number): number {
    const initialRatio = position.initialXPrice / position.initialYPrice
    const currentRatio = currentXPrice / currentYPrice
    const priceRatioChange = currentRatio / initialRatio

    // Standard IL formula for concentrated liquidity
    return (2 * Math.sqrt(priceRatioChange) / (1 + priceRatioChange)) - 1
  }
}`,
    usage: 'Use this class to calculate comprehensive position metrics for portfolio analysis and performance tracking.',
    benefits: [
      'Accurate P&L calculations',
      'Real-time APR tracking',
      'Impermanent loss analysis',
      'Performance benchmarking'
    ]
  },
  {
    id: 'smart-caching',
    title: 'Intelligent Cache Manager',
    description: 'Advanced caching system with TTL, LRU eviction, and predictive preloading',
    category: 'advanced',
    complexity: 'advanced',
    code: `export class SmartCacheManager {
  private cache = new Map<string, CacheEntry>()
  private accessLog = new Map<string, number[]>()
  private maxSize = 1000

  async get<T>(key: string, fetcher: () => Promise<T>, ttl = 30000): Promise<T> {
    this.recordAccess(key)

    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      cached.hits++
      return cached.data as T
    }

    const data = await fetcher()
    this.set(key, data, ttl)

    // Trigger predictive preloading
    this.schedulePreloading(key)

    return data
  }

  private set<T>(key: string, data: T, ttl: number) {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccess: Date.now()
    })
  }

  private schedulePreloading(accessedKey: string) {
    // Analyze access patterns to predict next likely requests
    const pattern = this.analyzeAccessPattern(accessedKey)

    if (pattern.confidence > 0.8) {
      setTimeout(() => {
        this.preloadRelatedData(pattern.predictedKeys)
      }, pattern.delay)
    }
  }

  getCacheStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const totalRequests = entries.length + totalHits

    return {
      hitRate: (totalHits / totalRequests) * 100,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      efficiency: this.calculateEfficiency()
    }
  }
}`,
    usage: 'Implement this cache manager to dramatically reduce RPC calls and improve application performance.',
    benefits: [
      '90%+ cache hit rate achievement',
      'Intelligent predictive preloading',
      'Memory-efficient LRU eviction',
      'Real-time performance monitoring'
    ]
  }
]

export function DeveloperResources() {
  const [selectedPath, setSelectedPath] = useState<LearningPath>(LEARNING_PATHS[0])
  const [currentStep, setCurrentStep] = useState(0)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (code: string, snippetId: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedSnippet(snippetId)
    toast({
      title: "Code copied!",
      description: "Code snippet copied to clipboard"
    })
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Rocket className="h-8 w-8 text-blue-500" />
          Developer Resources
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive guides, code examples, and tools to accelerate your DLMM integration
        </p>
      </motion.div>

      <Tabs defaultValue="learning-paths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="code-snippets">Code Snippets</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Learning Paths */}
        <TabsContent value="learning-paths" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {LEARNING_PATHS.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all h-full ${
                    selectedPath.id === path.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedPath(path)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                      <Badge variant="outline">{path.duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Skills You&apos;ll Learn:</h4>
                      <div className="flex flex-wrap gap-1">
                        {path.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedPath && (
            <motion.div
              key={selectedPath.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{selectedPath.title} - Implementation Steps</CardTitle>
                  <CardDescription>
                    Follow these steps to master {selectedPath.title.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedPath.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 border rounded-lg ${
                          currentStep === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <h3 className="font-semibold">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>

                            {step.commands && (
                              <div>
                                <h4 className="font-medium mb-2">Commands:</h4>
                                {step.commands.map((command, cmdIndex) => (
                                  <div key={cmdIndex} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm font-mono mb-2">
                                    {command}
                                  </div>
                                ))}
                              </div>
                            )}

                            {step.code && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Code:</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(step.code!, `step-${index}`)}
                                  >
                                    {copiedSnippet === `step-${index}` ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <SyntaxHighlighter
                                  language="typescript"
                                  style={oneDark}
                                  customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                >
                                  {step.code}
                                </SyntaxHighlighter>
                              </div>
                            )}

                            {step.notes && (
                              <div>
                                <h4 className="font-medium mb-2">Notes:</h4>
                                <ul className="space-y-1">
                                  {step.notes.map((note, noteIndex) => (
                                    <li key={noteIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Quick Start */}
        <TabsContent value="quick-start" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get up and running with the Saros DLMM SDK in 15 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <StaggerList variant="slideLeft" staggerDelay={0.1}>
                  {QUICK_START_STEPS.map((step, index) => (
                    <motion.div
                      key={index}
                      className="p-4 border rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>

                          {step.commands && (
                            <div>
                              <h4 className="font-medium mb-2">Run these commands:</h4>
                              {step.commands.map((command, cmdIndex) => (
                                <div key={cmdIndex} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm font-mono mb-2 flex items-center justify-between">
                                  <code>{command}</code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(command, `cmd-${index}-${cmdIndex}`)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.code && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Add this code:</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(step.code!, `quickstart-${index}`)}
                                >
                                  {copiedSnippet === `quickstart-${index}` ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <SyntaxHighlighter
                                language="typescript"
                                style={oneDark}
                                customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
                              >
                                {step.code}
                              </SyntaxHighlighter>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </StaggerList>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Snippets */}
        <TabsContent value="code-snippets" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {CODE_SNIPPETS.map((snippet, index) => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{snippet.title}</CardTitle>
                    <CardDescription>{snippet.description}</CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{snippet.category}</Badge>
                      <Badge className={getDifficultyColor(snippet.complexity)}>
                        {snippet.complexity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{snippet.usage}</p>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Implementation:</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(snippet.code, snippet.id)}
                        >
                          {copiedSnippet === snippet.id ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        language="typescript"
                        style={oneDark}
                        customStyle={{
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          maxHeight: '300px'
                        }}
                      >
                        {snippet.code}
                      </SyntaxHighlighter>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Benefits:</h4>
                      <div className="space-y-1">
                        {snippet.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Additional Resources */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Book className="h-6 w-6" />,
                title: 'Official Documentation',
                description: 'Complete SDK documentation with API reference',
                link: '#',
                type: 'Documentation'
              },
              {
                icon: <Github className="h-6 w-6" />,
                title: 'Source Code',
                description: 'View the complete implementation on GitHub',
                link: '#',
                type: 'Code'
              },
              {
                icon: <Play className="h-6 w-6" />,
                title: 'Live Demo',
                description: 'Interactive demo with real-time features',
                link: '#',
                type: 'Demo'
              },
              {
                icon: <Download className="h-6 w-6" />,
                title: 'Starter Template',
                description: 'Pre-configured Next.js template with SDK',
                link: '#',
                type: 'Template'
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: 'Community',
                description: 'Join the developer community for support',
                link: '#',
                type: 'Community'
              },
              {
                icon: <MessageCircle className="h-6 w-6" />,
                title: 'Support',
                description: 'Get help with your implementation',
                link: '#',
                type: 'Support'
              }
            ].map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-blue-500">{resource.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{resource.description}</p>
                    <Button variant="outline" className="w-full gap-2">
                      {resource.type === 'Code' ? (
                        <Github className="h-4 w-4" />
                      ) : resource.type === 'Demo' ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Access {resource.type}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}