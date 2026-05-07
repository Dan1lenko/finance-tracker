export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '3px solid rgba(139,92,246,0.2)', borderTopColor: 'var(--accent-violet)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Завантаження...</p>
      </div>
    </div>
  );
}
