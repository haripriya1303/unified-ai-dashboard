import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrationsService } from '@/services/integrationsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, Github, Notebook, Kanban, Mail, Clock, Zap, Monitor } from 'lucide-react';
import type { Integration } from '@/types/integrations';
import { useIntegrationStore } from '@/hooks/useIntegrationStore';
import ConnectIntegrationModal from '@/components/integrations/ConnectIntegrationModal';
import DisconnectModal from '@/components/integrations/DisconnectModal';
import type { ConnectionFormData } from '@/components/integrations/ConnectIntegrationModal';

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

  const connectIntegration = useIntegrationStore(s => s.connectIntegration);
  const disconnectIntegration = useIntegrationStore(s => s.disconnectIntegration);
  const integrationStatus = useIntegrationStore(s => s.integrationStatus);
  const connectionPhase = useIntegrationStore(s => s.connectionPhase);
  const connectionLoading = useIntegrationStore(s => s.connectionLoading);
  const getStatus = useIntegrationStore(s => s.getStatus);
  const getPhase = useIntegrationStore(s => s.getPhase);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [disconnectingIntegration, setDisconnectingIntegration] = useState<Integration | null>(null);

  const handleConnect = (integration: Integration) => {
    setConnectingId(integration.id);
    setConnectModalOpen(true);
  };

  const handleConnectSubmit = async (formData: ConnectionFormData) => {
    if (!connectingId) return;
    const enabledFeatures = Object.entries(formData.features).filter(([, v]) => v).map(([k]) => k);
    await connectIntegration(connectingId, {
      connectedApps: enabledFeatures,
      email: formData.email,
      domain: formData.domain,
    });
    setConnectModalOpen(false);
    setConnectingId(null);
  };

  const handleDisconnectClick = (integration: Integration) => {
    setDisconnectingIntegration(integration);
    setDisconnectModalOpen(true);
  };

  const handleDisconnectConfirm = () => {
    if (!disconnectingIntegration) return;
    // TODO: Connect to backend API POST /api/integrations/disconnect
    disconnectIntegration(disconnectingIntegration.id);
    setDisconnectModalOpen(false);
    setDisconnectingIntegration(null);
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
          const phase = store.getPhase(integration.id);

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
                      {phase === 'verifying' ? 'Waiting for workspace approval...' : isSyncing ? 'Syncing...' : integration.lastSync || 'Just now'}
                    </span>
                    {integration.eventsCount && <span className="tabular-nums">{integration.eventsCount} events</span>}
                  </div>
                ) : phase === 'failed' ? (
                  <span className="text-xs text-destructive">Connection failed — try again</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Not connected</span>
                )}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm" className="text-xs h-7">Configure</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => handleDisconnectClick(integration)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs h-7"
                      disabled={isSyncing || phase === 'connecting' || phase === 'verifying'}
                      onClick={() => handleConnect(integration)}
                    >
                      {phase === 'connecting' || phase === 'verifying' ? 'Connecting…' : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {(!data || data.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-12">Connect integrations to start syncing data.</p>
      )}

      <ConnectIntegrationModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onConnect={handleConnectSubmit}
        loading={connectingId ? store.connectionLoading[connectingId] : false}
        integrationId={connectingId}
      />

      <DisconnectModal
        open={disconnectModalOpen}
        onOpenChange={setDisconnectModalOpen}
        integrationName={disconnectingIntegration?.name || ''}
        onConfirm={handleDisconnectConfirm}
      />
    </div>
  );
};

export default IntegrationsPage;
