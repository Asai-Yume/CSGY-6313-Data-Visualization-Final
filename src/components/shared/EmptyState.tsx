export function EmptyState({ label = 'No records match the current filters.' }: { label?: string }) {
  return <div className="status-card">{label}</div>;
}
