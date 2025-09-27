'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Code,
  Book,
  Play,
  Download,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  Github,
  Sparkles,
  Database,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SDKFeatureMap } from '@/components/sdk/sdk-feature-map'
import { CodeComparisonWidget } from '@/components/sdk/code-comparison-widget'
import { LivePerformanceMetrics } from '@/components/sdk/live-performance-metrics'
import { AnimatedNumber } from '@/components/animations/animated-number'
import { getSDKStats } from '@/lib/sdk-showcase/sdk-features-data'

interface DeveloperResource {
  id: string
  title: string
  description: string
  type: 'guide' | 'example' | 'documentation' | 'tool'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
  content: {
    overview: string
    steps?: string[]
    codeExample?: string
    benefits: string[]
  }
}

const DEVELOPER_RESOURCES: DeveloperResource[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Saros DLMM SDK',
    description: 'Complete guide to integrating the Saros DLMM SDK in your project',
    type: 'guide',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    tags: ['setup', 'installation', 'basics'],
    content: {
      overview: 'Learn how to set up and configure the Saros DLMM SDK for your Next.js or React application.',
      steps: [
        'Install the SDK: npm install @saros-finance/dlmm-sdk',
        'Initialize the DLMM client with your RPC endpoint',
        'Configure environment variables',
        'Set up wallet integration',
        'Make your first SDK call'
      ],
      codeExample: `import { LiquidityBookServices } from '@saros-finance/dlmm-sdk'
import { Connection } from '@solana/web3.js'

// Initialize the SDK
const connection = new Connection(process.env.RPC_URL!)
const dlmmServices = new LiquidityBookServices(connection)

// Get all available pairs
const pairs = await dlmmServices.getAllLbPairs()
console.log('Available pairs:', pairs.length)`,
      benefits: [
        'Type-safe API calls',
        'Built-in error handling',
        'Automatic connection management',
        'Comprehensive documentation'
      ]
    }
  },
  {
    id: 'position-management',
    title: 'Advanced Position Management',
    description: 'Implement sophisticated position tracking and analytics',
    type: 'example',
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    tags: ['positions', 'analytics', 'real-time'],
    content: {
      overview: 'Build a complete position management system with real-time updates and analytics.',
      steps: [
        'Set up position polling with intelligent caching',
        'Implement P&L calculations',
        'Add real-time price feeds',
        'Create position analytics dashboard',
        'Build position migration tools'
      ],
      codeExample: `// Enhanced position management hook
export function usePositionManagement(userPubkey: PublicKey) {
  const [positions, setPositions] = useState<PositionInfo[]>([])
  const [analytics, setAnalytics] = useState<PositionAnalytics[]>([])

  // Real-time position updates with caching
  useEffect(() => {
    const interval = setInterval(async () => {
      const userPositions = await dlmmClient.getUserPositions({
        userPubkey
      })

      // Calculate analytics
      const positionAnalytics = await Promise.all(
        userPositions.map(calculatePositionAnalytics)
      )

      setPositions(userPositions)
      setAnalytics(positionAnalytics)
    }, 30000) // 30-second polling

    return () => clearInterval(interval)
  }, [userPubkey])

  return { positions, analytics }
}`,
      benefits: [
        'Real-time position tracking',
        'Intelligent caching system',
        'Comprehensive analytics',
        'Performance optimized'
      ]
    }
  },
  {
    id: 'oracle-integration',
    title: 'Multi-Provider Oracle Integration',
    description: 'Implement robust price feeds with fallback mechanisms',
    type: 'example',
    difficulty: 'advanced',
    estimatedTime: '45 minutes',
    tags: ['oracle', 'pricing', 'reliability'],
    content: {
      overview: 'Build a production-ready oracle system with multiple providers and intelligent fallbacks.',
      steps: [
        'Set up Pyth Network integration',
        'Configure Switchboard fallback',
        'Implement price validation logic',
        'Add confidence scoring',
        'Create monitoring dashboard'
      ],
      codeExample: `class EnhancedPriceFeeds {
  private providers = ['pyth', 'switchboard']
  private cache = new Map<string, CachedPrice>()

  async getPrice(tokenAddress: string): Promise<PriceData> {
    // Check cache first
    const cached = this.getCachedPrice(tokenAddress)
    if (cached && !this.isStale(cached)) {
      return cached.data
    }

    // Try primary provider (Pyth)
    try {
      const pythPrice = await this.getPythPrice(tokenAddress)
      if (this.validatePrice(pythPrice)) {
        this.cachePrice(tokenAddress, pythPrice)
        return pythPrice
      }
    } catch (error) {
      console.warn('Pyth provider failed:', error)
    }

    // Fallback to Switchboard
    try {
      const switchboardPrice = await this.getSwitchboardPrice(tokenAddress)
      if (this.validatePrice(switchboardPrice)) {
        this.cachePrice(tokenAddress, switchboardPrice)
        return switchboardPrice
      }
    } catch (error) {
      console.error('All price providers failed')
      throw new Error('Unable to fetch price')
    }
  }
}`,
      benefits: [
        '99.9% uptime guarantee',
        'Multiple provider fallbacks',
        'Intelligent price validation',
        'Confidence scoring system'
      ]
    }
  },
  {
    id: 'performance-optimization',
    title: 'SDK Performance Optimization Guide',
    description: 'Maximize SDK performance with advanced caching and optimization techniques',
    type: 'guide',
    difficulty: 'advanced',
    estimatedTime: '60 minutes',
    tags: ['performance', 'caching', 'optimization'],
    content: {
      overview: 'Learn advanced techniques to optimize SDK performance and reduce RPC calls by up to 60%.',
      steps: [
        'Implement intelligent caching strategies',
        'Set up connection pooling',
        'Configure request batching',
        'Add performance monitoring',
        'Optimize cache invalidation'
      ],
      codeExample: `// Advanced caching implementation
class PredictiveCacheManager {
  private cache = new Map<string, CacheEntry>()
  private userBehavior = new UserBehaviorAnalyzer()

  async predictAndPreload(userPattern: UserBehaviorPattern) {
    // Analyze user behavior to predict next requests
    const predictions = this.userBehavior.predictNextRequests(userPattern)

    // Preload likely requests
    const preloadPromises = predictions.map(async (prediction) => {
      if (prediction.confidence > 0.8) {
        const data = await this.fetchData(prediction.key)
        this.cache.set(prediction.key, {
          data,
          timestamp: Date.now(),
          ttl: 30000,
          hits: 0
        })
      }
    })

    await Promise.all(preloadPromises)
  }

  getCacheStats(): CacheStats {
    return {
      hitRate: this.calculateHitRate(),
      size: this.cache.size,
      efficiency: this.calculateEfficiency()
    }
  }
}`,
      benefits: [
        '60% reduction in RPC calls',
        '90%+ cache hit rate',
        'Predictive data loading',
        'Real-time performance monitoring'
      ]
    }
  }
]

export default function SDKExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedResource, setSelectedResource] = useState<DeveloperResource | null>(null)

  const stats = getSDKStats()

  const filteredResources = DEVELOPER_RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || resource.type === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <Book className="h-4 w-4" />
      case 'example':
        return <Code className="h-4 w-4" />
      case 'documentation':
        return <ExternalLink className="h-4 w-4" />
      case 'tool':
        return <Database className="h-4 w-4" />
      default:
        return <Code className="h-4 w-4" />
    }
  }

  if (selectedResource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setSelectedResource(null)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explorer
          </Button>

          {/* Resource Detail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {getTypeIcon(selectedResource.type)}
                      {selectedResource.title}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {selectedResource.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(selectedResource.difficulty)}>
                      {selectedResource.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {selectedResource.estimatedTime}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {selectedResource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{selectedResource.content.overview}</p>

                {selectedResource.content.steps && (
                  <div>
                    <h3 className="font-semibold mb-3">Implementation Steps</h3>
                    <ol className="space-y-2">
                      {selectedResource.content.steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedResource.content.codeExample && (
                  <div>
                    <h3 className="font-semibold mb-3">Code Example</h3>
                    <CodeComparisonWidget />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Key Benefits</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {selectedResource.content.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link href="/showcase">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Showcase
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SDK Feature Explorer
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Interactive exploration of the Saros DLMM SDK with comprehensive examples,
            performance metrics, and developer resources.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  <AnimatedNumber value={stats.completionPercentage} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground">SDK Coverage</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  <AnimatedNumber value={stats.completedFeatures} />
                </div>
                <div className="text-xs text-muted-foreground">Features</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  <AnimatedNumber value={stats.rpcReduction} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground">RPC Saved</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  <AnimatedNumber value={DEVELOPER_RESOURCES.length} />
                </div>
                <div className="text-xs text-muted-foreground">Resources</div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="features" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="features">SDK Features</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Dev Resources</TabsTrigger>
          </TabsList>

          {/* SDK Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SDKFeatureMap />
            </motion.div>
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CodeComparisonWidget />
            </motion.div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LivePerformanceMetrics />
            </motion.div>
          </TabsContent>

          {/* Developer Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search and Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Developer Resources
                  </CardTitle>
                  <CardDescription>
                    Comprehensive guides, examples, and tools for SDK integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="guide">Guides</SelectItem>
                        <SelectItem value="example">Examples</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="tool">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Resources Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getTypeIcon(resource.type)}
                          {resource.title}
                        </CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                        <div className="flex items-center gap-2 pt-2">
                          <Badge className={getDifficultyColor(resource.difficulty)}>
                            {resource.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {resource.estimatedTime}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => setSelectedResource(resource)}
                          className="w-full"
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Explore Resource
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Build with the SDK?</h2>
              <p className="text-blue-100 mb-6">
                Start implementing these patterns in your own DLMM application
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Github className="h-5 w-5" />
                  View Source Code
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-white border-white hover:bg-white hover:text-blue-600">
                  <Download className="h-5 w-5" />
                  Download Examples
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}