import { Sparkles, Zap, Clock } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

export const ContextPanel = () => {
  const { data } = useDashboard();

  return (
    <aside className="hidden w-80 flex-shrink-0 flex-col border-l border-border/50 bg-card/20 xl:flex overflow-y-auto scrollbar-thin">
      {/* AI Summary */}
      <div className="border-b border-border/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">AI Summary</h3>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm leading-relaxed text-foreground/80">
            {data?.ai_summary || 'Analyzing your workspace...'}
          </p>
        </div>
      </div>

      {/* Connected Apps */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connected Apps</h3>
        </div>
        <div className="space-y-3">
          {data?.connected_apps?.map(app => (
            <div key={app.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${app.status === 'connected' ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                <span className="text-sm text-foreground">{app.name}</span>
              </div>
              {app.lastSync && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{app.lastSync}</span>
                </div>
              )}
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No apps connected yet.</p>
          )}
        </div>
      </div>
    </aside>
  );
};
