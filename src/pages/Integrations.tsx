import { useQuery } from '@tanstack/react-query';
import { integrationsService } from '@/services/integrationsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, Github, Notebook, Kanban, Mail, Clock, Zap } from 'lucide-react';
import type { Integration } from '@/types/integrations';

const ICON_MAP: Record<string, React.ElementType> = {
  slack: MessageSquare,
  github: Github,
  notebook: Notebook,
  kanban: Kanban,
  mail: Mail,
};

const IntegrationsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsService.getIntegrations,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-sm text-muted-foreground mb-6">Connect your tools to sync workspace data automatically.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((integration: Integration) => {
          const Icon = ICON_MAP[integration.icon] || Zap;
          const isConnected = integration.status === 'connected';
          return (
            <div key={integration.id} className="rounded-xl border border-border/50 bg-card/30 p-5 surface-glow transition-colors hover:bg-accent/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full mt-1 ${isConnected ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
              </div>
              <div className="flex items-center justify-between">
                {isConnected ? (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{integration.lastSync}</span>
                    {integration.eventsCount && <span className="tabular-nums">{integration.eventsCount} events</span>}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not connected</span>
                )}
                <Button variant={isConnected ? 'outline' : 'default'} size="sm" className="text-xs h-7">
                  {isConnected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {(!data || data.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-12">Connect integrations to start syncing data.</p>
      )}
    </div>
  );
};

export default IntegrationsPage;
