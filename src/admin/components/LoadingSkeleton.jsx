export default function LoadingSkeleton({ rows = 4, cols = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: rows * cols }, (_, i) => (
        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-7 w-16 bg-white/10 rounded" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10" />
          </div>
          <div className="h-3 w-32 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
