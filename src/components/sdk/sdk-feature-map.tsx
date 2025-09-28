'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  TrendingUp,
  BarChart3,
  Zap,
  DollarSign,
  ArrowRightLeft,
  PieChart,
  Gauge,
  Sparkles,
  ExternalLink,
  Copy
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { AnimatedNumber } from '@/components/animations/animated-number'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  SDK_CATEGORIES,
  getSDKStats,
  getFeaturesByCategory,
  type SDKFeature,
  type SDKCategory
} from '@/lib/sdk-showcase/sdk-features-data'

const iconMap = {
  Database,
  TrendingUp,
  BarChart3,
  Zap,
  DollarSign,
  ArrowRightLeft,
  PieChart,
  Gauge,
  Sparkles
}

const getStatusIcon = (implementation: SDKFeature['implementation']) => {
  switch (implementation) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case 'partial':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'planned':
      return <AlertCircle className="h-5 w-5 text-gray-400" />
  }
}

const getComplexityColor = (complexity: SDKFeature['complexity']) => {
  switch (complexity) {
    case 'basic':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }
}

interface FeatureDetailModalProps {
  feature: SDKFeature
  isOpen: boolean
  onClose: () => void
}

function FeatureDetailModal({ feature, isOpen, onClose }: FeatureDetailModalProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(feature.implementation)}
            {feature.name}
            <Badge className={getComplexityColor(feature.complexity)}>
              {feature.complexity}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {feature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance Impact */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{feature.performanceImpact}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Implementation</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {feature.codeLocation}
                </code>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold mb-3">Key Benefits</h4>
            <div className="grid grid-cols-2 gap-2">
              {feature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4">
            <h4 className="font-semibold">Implementation Example</h4>
            <p className="text-sm text-muted-foreground">
              {feature.codeExample.description}
            </p>

            {feature.codeExample.before && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-red-600">❌ Before (Manual approach)</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(feature.codeExample.before!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <SyntaxHighlighter
                    language="typescript"
                    style={oneDark}
                    customStyle={{
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {feature.codeExample.before}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-green-600">✅ After (SDK approach)</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(feature.codeExample.after)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <SyntaxHighlighter
                  language="typescript"
                  style={oneDark}
                  customStyle={{
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {feature.codeExample.after}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CategoryCardProps {
  category: SDKCategory
  features: SDKFeature[]
  onFeatureClick: (feature: SDKFeature) => void
}

function CategoryCard({ category, features, onFeatureClick }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap]
  const completionRate = Math.round((category.completedFeatures / category.totalFeatures) * 100)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconComponent className={`h-6 w-6 text-${category.color}-500`} />
          {category.name}
        </CardTitle>
        <CardDescription>{category.description}</CardDescription>
        <div className="flex items-center gap-4 pt-2">
          <Badge variant="outline" className="text-xs">
            <AnimatedNumber value={completionRate} suffix="%" duration={1.5} />
          </Badge>
          <span className="text-xs text-muted-foreground">
            {category.completedFeatures}/{category.totalFeatures} features
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <StaggerList variant="slideLeft" staggerDelay={0.05}>
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => onFeatureClick(feature)}
                >
                  <div className="flex items-start gap-3 w-full">
                    {getStatusIcon(feature.implementation)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{feature.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {feature.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getComplexityColor(feature.complexity)}`}
                        >
                          {feature.complexity}
                        </Badge>
                        <span className="text-xs text-green-600 font-medium">
                          {feature.performanceImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </StaggerList>
        </div>
      </CardContent>
    </Card>
  )
}

export function SDKFeatureMap() {
  const [selectedFeature, setSelectedFeature] = useState<SDKFeature | null>(null)
  const stats = getSDKStats()

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold">SDK Feature Coverage</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive implementation of the Saros DLMM SDK with enterprise-grade enhancements
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <AnimatedNumber value={stats.completionPercentage} suffix="%" />
              </div>
              <div className="text-xs text-muted-foreground">SDK Utilization</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                <AnimatedNumber value={stats.completedFeatures} suffix={`/${stats.totalFeatures}`} />
              </div>
              <div className="text-xs text-muted-foreground">Features Implemented</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                <AnimatedNumber value={stats.rpcReduction} suffix="%" />
              </div>
              <div className="text-xs text-muted-foreground">RPC Reduction</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                <AnimatedNumber value={stats.performanceImprovement} suffix="x" />
              </div>
              <div className="text-xs text-muted-foreground">Performance Gain</div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Feature Categories Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {SDK_CATEGORIES.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CategoryCard
              category={category}
              features={getFeaturesByCategory(category.id)}
              onFeatureClick={setSelectedFeature}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <FeatureDetailModal
            feature={selectedFeature}
            isOpen={!!selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}