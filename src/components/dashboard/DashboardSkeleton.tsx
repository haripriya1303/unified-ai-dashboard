import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => (
  <div className="space-y-10 animate-fade-in">
    {/* AI Summary Skeleton */}
    <section>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-28 w-full rounded-lg" />
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Tasks Skeleton */}
      <section>
        <Skeleton className="h-3 w-32 mb-4" />
        <div className="space-y-1">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </section>

      {/* Messages Skeleton */}
      <section>
        <Skeleton className="h-3 w-36 mb-4" />
        <div className="space-y-1">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </section>
    </div>

    {/* Activity Skeleton */}
    <section>
      <Skeleton className="h-3 w-28 mb-4" />
      <div className="space-y-1">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </section>
  </div>
);
