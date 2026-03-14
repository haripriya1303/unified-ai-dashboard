import api from './api';
import type { ActivityItem } from '@/types/activity';

export const activityService = {
  getActivity: async (): Promise<ActivityItem[]> => {
    try {
      const { data } = await api.get('/activity');
      return data;
    } catch {
      /*
      TEMP MOCK DATA
      REMOVE WHEN FASTAPI BACKEND IS READY
      */
      return [
        { id: '1', title: 'Review Q3 API Docs', description: 'Complete API documentation review', status: 'in-progress', priority: 'high', source: 'Notion', createdAt: '2024-01-15', updatedAt: '2024-01-15', assignee: 'You' },
        { id: '2', title: 'Fix Auth hydration', description: 'Resolve hydration mismatch in auth flow', status: 'pending', priority: 'medium', source: 'GitHub', createdAt: '2024-01-14', updatedAt: '2024-01-15' },
        { id: '3', title: 'Deploy staging v2.4', description: 'Push latest changes to staging', status: 'completed', priority: 'high', source: 'Vercel', createdAt: '2024-01-13', updatedAt: '2024-01-14', assignee: 'CI/CD' },
      ];
    }
  },
};
