import { Sparkles, Zap, Clock, MessageSquare, GitPullRequest, FileText, Mail, Calendar, Kanban } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

/*
TEMP MOCK DATA
REMOVE WHEN FASTAPI BACKEND IS READY
*/
const INTEGRATION_EVENTS: Record<string, { icon: React.ElementType; text: string; time: string }[]> = {
  '1': [
    { icon: MessageSquare, text: 'Slack message from Alex', time: '2 min ago' },
    { icon: MessageSquare, text: 'New mention in #dev', time: '10 min ago' },
    { icon: MessageSquare, text: 'Thread reply in #general', time: '25 min ago' },
  ],
  '2': [
    { icon: GitPullRequest, text: 'PR #421 merged by Sarah', time: '5 min ago' },
    { icon: GitPullRequest, text: 'New issue opened in core', time: '20 min ago' },
    { icon: GitPullRequest, text: 'Deployment notification', time: '1 hr ago' },
  ],
  '3': [
    { icon: FileText, text: 'Page updated: Q1 Roadmap', time: '8 min ago' },
    { icon: FileText, text: 'Comment on API docs', time: '30 min ago' },
    { icon: FileText, text: 'Database row added', time: '1 hr ago' },
  ],
  '4': [
    { icon: Kanban, text: 'Issue moved to In Progress', time: '3 min ago' },
    { icon: Kanban, text: 'Sprint 12 started', time: '1 hr ago' },
    { icon: Kanban, text: 'Story completed: Auth flow', time: '2 hr ago' },
  ],
  '5': [
    { icon: Mail, text: 'New email from client', time: '4 min ago' },
    { icon: Calendar, text: 'Meeting in 30 minutes', time: '10 min ago' },
    { icon: FileText, text: 'Document shared with you', time: '45 min ago' },
  ],
  '6': [
    { icon: MessageSquare, text: 'Teams message from Alex', time: '2 min ago' },
    { icon: Mail, text: 'Outlook meeting scheduled', time: '15 min ago' },
    { icon: Calendar, text: 'Calendar event updated', time: '1 hr ago' },
  ],
};

const INTEGRATION_NAMES: Record<string, string> = {
  '1': 'Slack',
  '2': 'GitHub',
  '3': 'Notion',
  '4': 'Jira',
  '5': 'Google Workspace',
  '6': 'Microsoft Workspace',
};

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
      <div className="border-b border-border/40 p-6">
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

      {/* Recent Integration Events */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Events</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(INTEGRATION_EVENTS).slice(0, 3).map(([id, events]) => (
            <div key={id} className="space-y-2">
              <span className="text-xs font-medium text-foreground/70">{INTEGRATION_NAMES[id]}</span>
              {events.slice(0, 2).map((event, idx) => (
                <div key={idx} className="flex items-center gap-2.5 group">
                  <event.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground/80 truncate flex-1">{event.text}</span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{event.time}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
