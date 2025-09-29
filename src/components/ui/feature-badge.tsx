import * as React from "react"
import { Badge, badgeVariants } from "./badge"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"

export type FeatureStatus = "completed" | "partial" | "planned"

const featureStatusVariants = {
  completed: "border-transparent bg-green-500 text-white hover:bg-green-600",
  partial: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
  planned: "border-transparent bg-gray-400 text-white hover:bg-gray-500"
}

const featureStatusIcons = {
  completed: "✓",
  partial: "◐",
  planned: "◯"
}

export interface FeatureBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  featureId: number
  featureName: string
  status: FeatureStatus
  showDetails?: boolean
  compact?: boolean
}

function FeatureBadge({
  className,
  featureId,
  featureName,
  status,
  showDetails = false,
  compact = false,
  ...props
}: FeatureBadgeProps) {
  const statusIcon = featureStatusIcons[status]
  const statusClass = featureStatusVariants[status]

  const displayText = compact
    ? `SDK #${featureId} ${statusIcon}`
    : showDetails
      ? `SDK #${featureId}: ${featureName} ${statusIcon}`
      : `SDK #${featureId} ${statusIcon}`

  return (
    <Badge
      className={cn(statusClass, "font-mono text-xs", className)}
      {...props}
    >
      {displayText}
    </Badge>
  )
}

export { FeatureBadge }