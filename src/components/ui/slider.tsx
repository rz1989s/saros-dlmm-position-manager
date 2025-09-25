// Minimal stub component for testing
export const Slider = ({ value, onValueChange, max, min, step, className }: {
  value?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
}) => (
  <input
    type="range"
    value={value?.[0] || 0}
    onChange={(e) => onValueChange && onValueChange([parseFloat(e.target.value)])}
    max={max}
    min={min}
    step={step}
    className={className}
  />
)