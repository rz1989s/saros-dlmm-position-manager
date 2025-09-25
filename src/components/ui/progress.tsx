// Minimal stub component for testing
export const Progress = ({ value }: { value?: number }) => (
  <div>
    <div style={{ width: `${value || 0}%` }} />
  </div>
)