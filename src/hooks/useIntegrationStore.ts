import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export type ConnectionPhase = 'idle' | 'connecting' | 'verifying' | 'connected' | 'failed';

export interface IntegrationConnection {
  integrationId: string;
  status: 'connected' | 'disconnected' | 'syncing';
  phase: ConnectionPhase;
  connectedApps: string[];
  email?: string;
  domain?: string;
}

export interface IntegrationState {
  integrationStatus: Record<string, 'connected' | 'disconnected' | 'syncing'>;
  connectionPhase: Record<string, ConnectionPhase>;
  connectionLoading: Record<string, boolean>;
  connectionSuccess: Record<string, boolean>;
  connectionError: Record<string, string | null>;
  connections: Record<string, IntegrationConnection>;
}

export const useIntegrationStore = () => {
  const queryClient = useQueryClient();

  const [state, setState] = useState<IntegrationState>({
    integrationStatus: {},
    connectionPhase: {},
    connectionLoading: {},
    connectionSuccess: {},
    connectionError: {},
    connections: {},
  });

  const connectIntegration = useCallback(async (id: string, connection: Partial<IntegrationConnection>) => {
    // Phase 1: Connecting
    setState(prev => ({
      ...prev,
      connectionLoading: { ...prev.connectionLoading, [id]: true },
      connectionError: { ...prev.connectionError, [id]: null },
      connectionPhase: { ...prev.connectionPhase, [id]: 'connecting' },
      integrationStatus: { ...prev.integrationStatus, [id]: 'syncing' },
    }));

    try {
      // TODO: Replace with FastAPI endpoint POST /api/integrations/connect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 2: Verifying
      setState(prev => ({
        ...prev,
        connectionPhase: { ...prev.connectionPhase, [id]: 'verifying' },
      }));

      // TODO: Replace with FastAPI endpoint — poll or wait for verification
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Phase 3: Connected
      setState(prev => ({
        ...prev,
        connectionLoading: { ...prev.connectionLoading, [id]: false },
        connectionSuccess: { ...prev.connectionSuccess, [id]: true },
        connectionPhase: { ...prev.connectionPhase, [id]: 'connected' },
        integrationStatus: { ...prev.integrationStatus, [id]: 'connected' },
        connections: {
          ...prev.connections,
          [id]: { integrationId: id, status: 'connected', phase: 'connected', connectedApps: [], ...connection },
        },
      }));

      // Invalidate sidebar queries so connected apps + events refresh
      queryClient.invalidateQueries({ queryKey: ['workspace-sidebar'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-events'] });

      toast({
        title: 'Connection successful',
        description: 'Integration will activate once backend API is connected.',
      });
    } catch {
      setState(prev => ({
        ...prev,
        connectionLoading: { ...prev.connectionLoading, [id]: false },
        connectionPhase: { ...prev.connectionPhase, [id]: 'failed' },
        connectionError: { ...prev.connectionError, [id]: 'Failed to connect' },
        integrationStatus: { ...prev.integrationStatus, [id]: 'disconnected' },
      }));

      toast({
        title: 'Connection failed',
        description: 'Unable to connect integration. Please try again.',
        variant: 'destructive',
      });
    }
  }, [queryClient]);

  const disconnectIntegration = useCallback((id: string) => {
    // TODO: Replace with FastAPI endpoint POST /api/integrations/disconnect
    setState(prev => ({
      ...prev,
      integrationStatus: { ...prev.integrationStatus, [id]: 'disconnected' },
      connectionPhase: { ...prev.connectionPhase, [id]: 'idle' },
      connectionSuccess: { ...prev.connectionSuccess, [id]: false },
      connections: { ...prev.connections, [id]: undefined as any },
    }));

    queryClient.invalidateQueries({ queryKey: ['workspace-sidebar'] });
    queryClient.invalidateQueries({ queryKey: ['workspace-events'] });

    toast({
      title: 'Integration removed',
      description: 'The integration has been disconnected from your workspace.',
    });
  }, [queryClient]);

  const getStatus = useCallback((id: string) => {
    return state.integrationStatus[id] || null;
  }, [state.integrationStatus]);

  const getPhase = useCallback((id: string): ConnectionPhase => {
    return state.connectionPhase[id] || 'idle';
  }, [state.connectionPhase]);

  return {
    ...state,
    connectIntegration,
    disconnectIntegration,
    getStatus,
    getPhase,
  };
};
