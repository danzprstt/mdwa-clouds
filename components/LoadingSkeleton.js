export default function LoadingSkeleton() {
  return (
    <div className="file-grid" style={{ marginTop: 4 }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="skeleton-card" style={{ animationDelay: i * 0.1 + 's' }}>
          <div className="skeleton skeleton-thumb" />
          <div className="skeleton-body" style={{ background: 'var(--card)', border: 'none' }}>
            <div className="skeleton skeleton-line" style={{ width: '75%' }} />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line xshort" />
          </div>
        </div>
      ))}
    </div>
  );
}
