export function LoadingState({ label = 'Loading data…' }: { label?: string }) {
  return <div className="status-card">{label}</div>;
}
