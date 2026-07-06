/**
 * Portfolio Skeleton Loader Component
 * Renders glowing glass shimmer skeletons during initial data resolution
 */
export default function PortfolioSkeleton() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-pulse select-none">
      {/* Hero Skeleton */}
      <div className="w-full flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
        <div className="w-48 h-8 rounded-full bg-white/[0.04] border border-white/10" />
        <div className="w-3/4 sm:w-2/3 h-16 sm:h-20 rounded-2xl bg-white/[0.05]" />
        <div className="w-full h-12 rounded-xl bg-white/[0.03]" />
        <div className="flex gap-4 pt-4">
          <div className="w-40 h-12 rounded-full bg-white/[0.06]" />
          <div className="w-40 h-12 rounded-full bg-white/[0.04]" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="glass-panel p-6 rounded-3xl space-y-4 border border-white/[0.06] h-64 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06]" />
              <div className="w-20 h-6 rounded-full bg-white/[0.04]" />
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-6 rounded-lg bg-white/[0.06]" />
              <div className="w-full h-4 rounded bg-white/[0.03]" />
              <div className="w-5/6 h-4 rounded bg-white/[0.03]" />
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
