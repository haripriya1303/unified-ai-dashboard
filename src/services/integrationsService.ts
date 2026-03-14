import api from './api';
import type { Integration } from '@/types/integrations';

export const integrationsService = {
  getIntegrations: async (): Promise<Integration[]> => {
    try {
      const { data } = await api.get('/integrations');
      return data;
    } catch {
      /*
      TEMP MOCK DATA
      REMOVE WHEN FASTAPI BACKEND IS READY
      */
      return [
        { id: '1', name: 'Slack', description: 'Team communication and messaging', icon: 'slack', status: 'connected', category: 'communication', lastSync: '2 min ago', eventsCount: 142 },
        { id: '2', name: 'GitHub', description: 'Code repository and version control', icon: 'github', status: 'connected', category: 'development', lastSync: '5 min ago', eventsCount: 89 },
        { id: '3', name: 'Notion', description: 'Documentation and knowledge base', icon: 'notebook', status: 'connected', category: 'productivity', lastSync: 'Just now', eventsCount: 34 },
        { id: '4', name: 'Jira', description: 'Project tracking and management', icon: 'kanban', status: 'disconnected', category: 'project-management' },
        { id: '5', name: 'Google Workspace', description: 'Email, calendar, and documents', icon: 'mail', status: 'connected', category: 'productivity', lastSync: '10 min ago', eventsCount: 56 },
        { id: '6', name: 'Microsoft Workspace', description: 'Email, meetings, chats, and calendar from Microsoft services.', icon: 'microsoft', status: 'disconnected', category: 'communication' },
      ];
    }
  },
};
