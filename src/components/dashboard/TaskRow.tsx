import type { Task } from '@/types/dashboard';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-destructive/20 text-destructive',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-primary/20 text-primary',
  low: 'bg-muted text-muted-foreground',
};

const STATUS_COLORS: Record<string, string> = {
  'todo': 'border-muted-foreground/30',
  'in-progress': 'border-primary bg-primary/10',
  'completed': 'border-emerald-500 bg-emerald-500/10',
};

export const TaskRow = ({ title, status, priority, assignee, dueDate }: Task) => (
  <div className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-150 hover:bg-accent/50 surface-glow">
    <div className={`h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 ${STATUS_COLORS[status]}`} />
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium truncate ${status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
        {title}
      </p>
    </div>
    {assignee && <span className="text-xs text-muted-foreground hidden sm:block">{assignee}</span>}
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${PRIORITY_COLORS[priority]}`}>
      {priority}
    </span>
    {dueDate && <span className="text-xs text-muted-foreground tabular-nums">{dueDate}</span>}
  </div>
);
