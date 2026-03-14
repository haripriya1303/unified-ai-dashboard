import { Sparkles, Zap, Clock, MessageSquare, GitPullRequest, FileText, Mail, Kanban } from 'lucide-react';
import { useWorkspaceSidebar } from '@/hooks/useWorkspaceSidebar';
import { Skeleton } from '@/components/ui/skeleton';

const SOURCE_ICONS: Record<string, React.ElementType> = {
  Slack: MessageSquare,
  GitHub: GitPullRequest,
  Notion: FileText,
  Jira: Kanban,
  'Google Workspace': Mail,
  'Microsoft Workspace': Mail,
};

export const ContextPanel = () => {
  const { aiSummary, connectedApps, groupedEvents, isLoading, isEventsLoading, isError } = useWorkspaceSidebar();

  return (
    <aside className="hidden w-80 flex-shrink-0 flex-col border-l border-border/50 bg-card/20 xl:flex overflow-y-auto scrollbar-thin">
      {/* AI Summary */}
      <div className="border-b border-border/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">AI Summary</h3>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ) : aiSummary ? (
            <p className="text-sm leading-relaxed text-foreground/80">{aiSummary}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">AI summary generating...</p>
          )}
        </div>
      </div>

      {/* Connected Apps */}
      <div className="border-b border-border/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connected Apps</h3>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : connectedApps.length > 0 ? (
            connectedApps.map(app => (
              <div key={app.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${app.status === 'connected' ? 'bg-emerald-400' : app.status === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-muted-foreground/30'}`} />
                  <span className="text-sm text-foreground">{app.name}</span>
                </div>
                {app.lastSync && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{app.lastSync}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No integrations connected</p>
          )}
        </div>
      </div>

      {/* Recent Events — grouped by source */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Events</h3>
        </div>
        <div className="space-y-4">
          {isEventsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))
          ) : isError ? (
            <p className="text-sm text-muted-foreground">Unable to fetch workspace activity</p>
          ) : Object.keys(groupedEvents).length > 0 ? (
            Object.entries(groupedEvents).map(([source, events]) => {
              const Icon = SOURCE_ICONS[source] || Zap;
              return (
                <div key={source} className="space-y-2">
                  <span className="text-xs font-medium text-foreground/70">{source}</span>
                  {events.slice(0, 3).map(evt => (
                    <div key={evt.id} className="flex items-center gap-2.5 group">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground/80 truncate flex-1">{evt.event}</span>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">{evt.timestamp}</span>
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No recent events yet</p>
          )}
        </div>
      </div>
    </aside>
  );
};
