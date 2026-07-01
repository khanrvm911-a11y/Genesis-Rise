import { Sparkles, BarChart3 } from 'lucide-react';

function SkeletonBar({ width = '100%', height = '12px', className = '' }) {
  return (
    <div className={`rounded-lg bg-sl-gray/30 animate-pulse ${className}`}
      style={{ width, height }} />
  );
}

function SkeletonCircle({ size = '40px' }) {
  return (
    <div className={`rounded-full bg-sl-gray/30 animate-pulse shrink-0`}
      style={{ width: size, height: size }} />
  );
}

function SkeletonCard({ lines = 3, height = '80px', className = '' }) {
  return (
    <div className={`rounded-xl border border-sl-purple/15 bg-sl-gray/20 p-3.5 ${className}`}>
      <SkeletonBar width="40%" height="10px" className="mb-2.5" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBar key={i} width={`${70 - i * 15}%`} height="8px" className="mb-1.5" />
      ))}
    </div>
  );
}

export function PageSkeleton({ title = 'Loading...', description = 'Please wait' }) {
  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SkeletonBar width="160px" height="22px" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
          <SkeletonCard lines={4} height="120px" />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="space-y-4">
          <SkeletonBar width="120px" height="22px" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={1} height="64px" />)}
          </div>
          <SkeletonCard lines={0} height="200px" />
          <SkeletonCard lines={0} height="160px" />
        </div>
      </div>
    </div>
  );
}

export function PlannerSkeleton() {
  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="space-y-4">
          <SkeletonBar width="100px" height="22px" />
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="flex-1 rounded-xl bg-sl-gray/20 border border-sl-purple/15 p-2 animate-pulse">
                <SkeletonBar width="100%" height="10px" className="mb-1" />
                <SkeletonCircle size="28px" />
                <SkeletonBar width="60%" height="8px" className="mt-1" />
              </div>
            ))}
          </div>
          <SkeletonCard lines={5} height="200px" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="space-y-4">
          <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 p-5 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <SkeletonCircle size="56px" />
              <div className="flex-1">
                <SkeletonBar width="60%" height="16px" className="mb-2" />
                <SkeletonBar width="40%" height="10px" />
              </div>
            </div>
            <SkeletonBar width="100%" height="8px" className="mb-3" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => <SkeletonCard key={i} lines={1} height="48px" />)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={1} height="64px" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
