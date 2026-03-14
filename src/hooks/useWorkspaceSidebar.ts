import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { ConnectedApp } from '@/types/dashboard';
import { useIntegrationStore } from './useIntegrationStore';
import { useMemo } from 'react';

export interface WorkspaceEvent {
  id: string;
  source: string;
  event: string;
  timestamp: string;
}

export interface WorkspaceSidebarState {
  aiSummary: string | null;
  connectedApps: ConnectedApp[];
  recentEvents: WorkspaceEvent[];
}

const INTEGRATION_DISPLAY_NAMES: Record<string, string> = {
  slack: 'Slack',
  github: 'GitHub',
  notion: 'Notion',
  jira: 'Jira',
  google: 'Google Workspace',
  microsoft: 'Microsoft Workspace',
};

/*
TEMP MOCK DATA
REMOVE WHEN FASTAPI BACKEND IS READY
*/
const MOCK_EVENTS: WorkspaceEvent[] = [
  { id: '1', source: 'Slack', event: 'Slack message from Alex', timestamp: '2 min ago' },
  { id: '2', source: 'Slack', event: 'New mention in #dev', timestamp: '10 min ago' },
  { id: '3', source: 'GitHub', event: 'PR #421 merged by Sarah', timestamp: '5 min ago' },
  { id: '4', source: 'GitHub', event: 'Deployment notification', timestamp: '1 hr ago' },
  { id: '5', source: 'Google Workspace', event: 'New email from client', timestamp: '4 min ago' },
];

const fetchEvents = async (): Promise<WorkspaceEvent[]> => {
  // TODO: Connect to FastAPI backend GET /api/events
  try {
    const { data } = await api.get('/events');
    return data;
  } catch {
    return MOCK_EVENTS;
  }
};

const fetchSidebarData = async (): Promise<{ aiSummary: string }> => {
  // TODO: Connect to FastAPI backend GET /api/dashboard
  try {
    const { data } = await api.get('/dashboard');
    return { aiSummary: data.ai_summary };
  } catch {
    return {
      aiSummary: "You have 2 active tasks today. Sarah is waiting on your PR review for the onboarding flow. The staging deploy completed successfully — consider promoting to production.",
    };
  }
};

export const useWorkspaceSidebar = () => {
  const dashboardQuery = useQuery({
    queryKey: ['workspace-sidebar'],
    queryFn: fetchSidebarData,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const eventsQuery = useQuery({
    queryKey: ['workspace-events'],
    queryFn: fetchEvents,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Group events by source
  const groupedEvents = (eventsQuery.data ?? []).reduce<Record<string, WorkspaceEvent[]>>((acc, evt) => {
    if (!acc[evt.source]) acc[evt.source] = [];
    acc[evt.source].push(evt);
    return acc;
  }, {});

  return {
    aiSummary: dashboardQuery.data?.aiSummary ?? null,
    connectedApps: dashboardQuery.data?.connectedApps ?? [],
    recentEvents: eventsQuery.data ?? [],
    groupedEvents,
    isLoading: dashboardQuery.isLoading,
    isEventsLoading: eventsQuery.isLoading,
    isError: dashboardQuery.isError || eventsQuery.isError,
  };
};
