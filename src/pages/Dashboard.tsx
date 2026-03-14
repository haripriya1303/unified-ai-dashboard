import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { TaskRow } from '@/components/dashboard/TaskRow';
import { MessageItem } from '@/components/dashboard/MessageItem';
import { ActivityRow } from '@/components/dashboard/ActivityRow';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-3" />
        <h2 className="text-sm font-semibold text-foreground mb-1">Failed to sync workspace data</h2>
        <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* AI Summary */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          AI Summary
        </h2>
        <SummaryCard summary={data.ai_summary} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Today's Priorities
          </h2>
          {data.tasks.length > 0 ? (
            <div className="space-y-1">
              {data.tasks.map(task => <TaskRow key={task.id} {...task} />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No tasks detected today.</p>
          )}
        </section>

        {/* Messages */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Important Messages
          </h2>
          {data.messages.length > 0 ? (
            <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
              {data.messages.map(msg => <MessageItem key={msg.id} {...msg} />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No new messages.</p>
          )}
        </section>
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Recent Activity
        </h2>
        {data.workspace_activity.length > 0 ? (
          <div className="space-y-1">
            {data.workspace_activity.map(act => <ActivityRow key={act.id} {...act} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No workspace activity detected yet.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
