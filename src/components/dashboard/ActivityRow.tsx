import type { WorkspaceActivity } from '@/types/dashboard';
import { GitPullRequest, Rocket, MessageCircle, GitCommit, Zap } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ElementType> = {
  pr: GitPullRequest,
  deploy: Rocket,
  comment: MessageCircle,
  commit: GitCommit,
  message: Zap,
};

export const ActivityRow = ({ title, description, source, timestamp, actor, type }: WorkspaceActivity) => {
  const Icon = TYPE_ICONS[type] || Zap;
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent/30">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{source}</span>
      <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">{timestamp}</span>
    </div>
  );
};
