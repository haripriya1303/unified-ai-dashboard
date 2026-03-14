import { useActivity } from '@/hooks/useActivity';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityItem } from '@/types/activity';

const COLUMNS: { key: ActivityItem['status']; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'bg-muted-foreground/30' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-primary' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-500' },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-destructive',
  high: 'text-orange-400',
  medium: 'text-primary',
  low: 'text-muted-foreground',
};

const ActivityPage = () => {
  const { data, isLoading } = useActivity();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-6 animate-fade-in">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => {
          const items = data?.filter(item => item.status === col.key) || [];
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-2 w-2 rounded-full ${col.color}`} />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{col.label}</h3>
                <span className="text-xs text-muted-foreground tabular-nums">({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.length > 0 ? items.map(item => (
                  <div key={item.id} className="rounded-lg border border-border/50 bg-card/30 p-4 transition-colors hover:bg-accent/30 surface-glow">
                    <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No items</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityPage;
