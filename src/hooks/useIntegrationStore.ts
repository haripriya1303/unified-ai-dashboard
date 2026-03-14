import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface IntegrationConnection {
  integrationId: string;
  status: 'connected' | 'disconnected' | 'syncing';
  connectedApps: string[];
  email?: string;
  domain?: string;
  connectionString?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface IntegrationState {
  integrationStatus: Record<string, 'connected' | 'disconnected' | 'syncing'>;
  connectionLoading: Record<string, boolean>;
  connectionSuccess: Record<string, boolean>;
  connectionError: Record<string, string | null>;
  connections: Record<string, IntegrationConnection>;
}

export const useIntegrationStore = () => {
  const [state, setState] = useState<IntegrationState>({
    integrationStatus: {},
    connectionLoading: {},
    connectionSuccess: {},
    connectionError: {},
    connections: {},
  });

  const connectIntegration = useCallback(async (id: string, connection: Partial<IntegrationConnection>) => {
    // Optimistic UI update
    setState(prev => ({
      ...prev,
      connectionLoading: { ...prev.connectionLoading, [id]: true },
      connectionError: { ...prev.connectionError, [id]: null },
      integrationStatus: { ...prev.integrationStatus, [id]: 'syncing' },
    }));

    try {
      // TODO: Replace with FastAPI endpoint POST /api/integrations/connect
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        connectionLoading: { ...prev.connectionLoading, [id]: false },
        connectionSuccess: { ...prev.connectionSuccess, [id]: true },
        integrationStatus: { ...prev.integrationStatus, [id]: 'connected' },
        connections: {
          ...prev.connections,
          [id]: { integrationId: id, status: 'connected', connectedApps: [], ...connection },
        },
      }));

      toast({
        title: 'Integration connected',
        description: 'Integration will activate once backend API is connected.',
      });
    } catch {
      setState(prev => ({
        ...prev,
        connectionLoading: { ...prev.connectionLoading, [id]: false },
        connectionError: { ...prev.connectionError, [id]: 'Failed to connect' },
        integrationStatus: { ...prev.integrationStatus, [id]: 'disconnected' },
      }));

      toast({
        title: 'Connection failed',
        description: 'Integration will activate once backend API is connected.',
        variant: 'destructive',
      });
    }
  }, []);

  const disconnectIntegration = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      integrationStatus: { ...prev.integrationStatus, [id]: 'disconnected' },
      connectionSuccess: { ...prev.connectionSuccess, [id]: false },
      connections: { ...prev.connections, [id]: undefined as any },
    }));
  }, []);

  const getStatus = useCallback((id: string) => {
    return state.integrationStatus[id] || null;
  }, [state.integrationStatus]);

  return {
    ...state,
    connectIntegration,
    disconnectIntegration,
    getStatus,
  };
};
