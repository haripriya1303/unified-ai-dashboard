import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

export type ConnectionPhase = 'idle' | 'connecting' | 'verifying' | 'connected' | 'failed';

export interface IntegrationConnection {
  integrationId: string;
  status: 'connected' | 'disconnected' | 'syncing';
  phase: ConnectionPhase;
  connectedApps: string[];
  email?: string;
  domain?: string;
  lastSynced?: string;
}

export interface IntegrationState {
  integrationStatus: Record<string, 'connected' | 'disconnected' | 'syncing'>;
  connectionPhase: Record<string, ConnectionPhase>;
  connectionLoading: Record<string, boolean>;
  connectionSuccess: Record<string, boolean>;
  connectionError: Record<string, string | null>;
  connections: Record<string, IntegrationConnection>;
  connectIntegration: (id: string, connection: Partial<IntegrationConnection>) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  getStatus: (id: string) => 'connected' | 'disconnected' | 'syncing' | null;
  getPhase: (id: string) => ConnectionPhase;
}

// TODO: Replace local state with FastAPI integration API
// GET /api/integrations
export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrationStatus: {},
  connectionPhase: {},
  connectionLoading: {},
  connectionSuccess: {},
  connectionError: {},
  connections: {},

  connectIntegration: async (id: string, connection: Partial<IntegrationConnection>) => {
    // Phase 1: Connecting
    set(prev => ({
      connectionLoading: { ...prev.connectionLoading, [id]: true },
      connectionError: { ...prev.connectionError, [id]: null },
      connectionPhase: { ...prev.connectionPhase, [id]: 'connecting' as const },
      integrationStatus: { ...prev.integrationStatus, [id]: 'syncing' as const },
    }));

    try {
      // TODO: Replace with FastAPI endpoint POST /api/integrations/connect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 2: Verifying
      set(prev => ({
        connectionPhase: { ...prev.connectionPhase, [id]: 'verifying' as const },
      }));

      // TODO: Replace with FastAPI endpoint — poll or wait for verification
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Phase 3: Connected
      set(prev => ({
        connectionLoading: { ...prev.connectionLoading, [id]: false },
        connectionSuccess: { ...prev.connectionSuccess, [id]: true },
        connectionPhase: { ...prev.connectionPhase, [id]: 'connected' as const },
        integrationStatus: { ...prev.integrationStatus, [id]: 'connected' as const },
        connections: {
          ...prev.connections,
          [id]: {
            integrationId: id,
            status: 'connected',
            phase: 'connected',
            connectedApps: [],
            lastSynced: 'Just now',
            ...connection,
          },
        },
      }));

      toast({
        title: 'Connection successful',
        description: 'Integration will activate once backend API is connected.',
      });
    } catch {
      set(prev => ({
        connectionLoading: { ...prev.connectionLoading, [id]: false },
        connectionPhase: { ...prev.connectionPhase, [id]: 'failed' as const },
        connectionError: { ...prev.connectionError, [id]: 'Failed to connect' },
        integrationStatus: { ...prev.integrationStatus, [id]: 'disconnected' as const },
      }));

      toast({
        title: 'Connection failed',
        description: 'Unable to connect integration. Please try again.',
        variant: 'destructive',
      });
    }
  },

  disconnectIntegration: (id: string) => {
    // TODO: Replace with FastAPI endpoint POST /api/integrations/disconnect
    set(prev => {
      const newConnections = { ...prev.connections };
      delete newConnections[id];
      return {
        integrationStatus: { ...prev.integrationStatus, [id]: 'disconnected' as const },
        connectionPhase: { ...prev.connectionPhase, [id]: 'idle' as const },
        connectionSuccess: { ...prev.connectionSuccess, [id]: false },
        connections: newConnections,
      };
    });

    toast({
      title: 'Integration removed',
      description: 'The integration has been disconnected from your workspace.',
    });
  },

  getStatus: (id: string) => {
    return get().integrationStatus[id] || null;
  },

  getPhase: (id: string) => {
    return get().connectionPhase[id] || 'idle';
  },
}));
