/**
 * SkeletonCard — animated placeholder while job cards are loading.
 */

const SkeletonCard = () => (
  <div className="card p-5 space-y-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="skeleton h-12 w-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
    <div className="space-y-2 pt-1">
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
    </div>
    <div className="flex gap-2 pt-1">
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="skeleton h-5 w-24 rounded-full" />
    </div>
    <div className="flex items-center justify-between pt-2">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
  </div>
)

export const SkeletonList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export default SkeletonCard
