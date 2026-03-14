import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrationsService } from '@/services/integrationsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, Github, Notebook, Kanban, Mail, Clock, Zap, Monitor } from 'lucide-react';
import type { Integration } from '@/types/integrations';
import { useIntegrationStore } from '@/hooks/useIntegrationStore';
import ConnectMicrosoftModal from '@/components/integrations/ConnectMicrosoftModal';
import type { MicrosoftConnectionData } from '@/components/integrations/ConnectMicrosoftModal';

const ICON_MAP: Record<string, React.ElementType> = {
  slack: MessageSquare,
  github: Github,
  notebook: Notebook,
  kanban: Kanban,
  mail: Mail,
  microsoft: Monitor,
};

const STATUS_DOT: Record<string, string> = {
  connected: 'bg-emerald-400',
  syncing: 'bg-amber-400 animate-pulse',
  disconnected: 'bg-muted-foreground/30',
  pending: 'bg-muted-foreground/30',
};

const IntegrationsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsService.getIntegrations,
  });

  const store = useIntegrationStore();
  const [microsoftModalOpen, setMicrosoftModalOpen] = useState(false);

  const handleConnect = (integration: Integration) => {
    if (integration.name === 'Microsoft Workspace') {
      setMicrosoftModalOpen(true);
    }
  };

  const handleMicrosoftConnect = async (connectionData: MicrosoftConnectionData) => {
    const apps = Object.entries(connectionData.apps).filter(([, v]) => v).map(([k]) => k);
    await store.connectIntegration('6', {
      connectedApps: apps,
      email: connectionData.email,
      domain: connectionData.domain,
      connectionString: connectionData.connectionString,
      tenantId: connectionData.tenantId,
      clientId: connectionData.clientId,
      clientSecret: connectionData.clientSecret,
    });
    setMicrosoftModalOpen(false);
  };

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
          const overrideStatus = store.getStatus(integration.id);
          const effectiveStatus = overrideStatus || integration.status;
          const isConnected = effectiveStatus === 'connected';
          const isSyncing = effectiveStatus === 'syncing';

          return (
            <div
              key={integration.id}
              className="group rounded-xl border border-border/50 bg-card/30 p-5 surface-glow transition-all duration-200 hover:bg-accent/20 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-muted/80">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full mt-1 ${STATUS_DOT[effectiveStatus] || STATUS_DOT.disconnected}`} />
              </div>
              <div className="flex items-center justify-between">
                {isConnected || isSyncing ? (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isSyncing ? 'Syncing...' : integration.lastSync || 'Just now'}
                    </span>
                    {integration.eventsCount && <span className="tabular-nums">{integration.eventsCount} events</span>}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not connected</span>
                )}
                <Button
                  variant={isConnected ? 'outline' : 'default'}
                  size="sm"
                  className="text-xs h-7"
                  disabled={isSyncing}
                  onClick={() => !isConnected && handleConnect(integration)}
                >
                  {isSyncing ? 'Syncing…' : isConnected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {(!data || data.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-12">Connect integrations to start syncing data.</p>
      )}

      <ConnectMicrosoftModal
        open={microsoftModalOpen}
        onOpenChange={setMicrosoftModalOpen}
        onConnect={handleMicrosoftConnect}
        loading={store.connectionLoading['6']}
      />
    </div>
  );
};

export default IntegrationsPage;
