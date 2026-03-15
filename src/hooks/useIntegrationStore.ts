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
    set(prev => ({
      connectionLoading: { ...prev.connectionLoading, [id]: true },
    }));

    try {
      const { default: api } = await import('@/services/api');
      
      const providerMap: Record<string, string> = {
        '1': 'slack',
        '2': 'github',
        '3': 'notion',
        '4': 'jira',
        '5': 'google',
        '6': 'microsoft'
      };
      
      const provider = providerMap[id];
      if (!provider) throw new Error("Unknown provider");
      
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      
      window.location.href = `${baseUrl}/integrations/${provider}/oauth?token=${token}`;
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

  disconnectIntegration: async (id: string) => {
    try {
      const { default: api } = await import('@/services/api');
      await api.post('/integrations/disconnect', { integration_id: id });
    } catch (e) {
      console.error(e);
    }
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
