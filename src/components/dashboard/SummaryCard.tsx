import { Sparkles } from 'lucide-react';

export const SummaryCard = ({ summary }: { summary: string }) => (
  <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 p-6 surface-glow">
    <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="flex items-start gap-3 relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground mb-2">Workspace Intelligence</h3>
        <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
      </div>
    </div>
  </div>
);
