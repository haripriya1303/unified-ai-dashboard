import type { Message } from '@/types/dashboard';
import { MessageSquare, Github, Mail } from 'lucide-react';

const SOURCE_ICONS: Record<string, React.ElementType> = {
  slack: MessageSquare,
  github: Github,
  email: Mail,
};

export const MessageItem = ({ sender, content, source, timestamp, unread }: Message) => {
  const Icon = SOURCE_ICONS[source] || MessageSquare;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors hover:bg-accent/30 ${unread ? 'bg-primary/5' : ''}`}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{sender}</span>
          {unread && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{content}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">{timestamp}</span>
    </div>
  );
};
