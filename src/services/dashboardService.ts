import api from './api';
import type { DashboardData } from '@/types/dashboard';

/*
TEMP MOCK DATA
REMOVE WHEN FASTAPI BACKEND IS READY
*/
const MOCK_DASHBOARD: DashboardData = {
  tasks: [
    { id: '1', title: 'Review Q3 API Documentation', status: 'in-progress', priority: 'high', assignee: 'You', dueDate: 'Today' },
    { id: '2', title: 'Fix hydration error in Auth flow', status: 'todo', priority: 'medium', dueDate: 'Tomorrow' },
    { id: '3', title: 'Deploy staging environment v2.4', status: 'completed', priority: 'high', assignee: 'You', dueDate: 'Yesterday' },
  ],
  messages: [
    { id: '1', sender: 'Sarah Chen', content: 'Can you review the PR for the new onboarding flow?', source: 'slack', timestamp: '10 min ago', unread: true },
    { id: '2', sender: 'GitHub', content: 'CI pipeline passed for feature/auth-redesign', source: 'github', timestamp: '25 min ago', unread: false },
  ],
  workspace_activity: [
    { id: '1', type: 'pr', title: 'PR #142 merged', description: 'feat: add workspace analytics dashboard', source: 'GitHub', timestamp: '15 min ago', actor: 'Alex Kim' },
    { id: '2', type: 'deploy', title: 'Production deploy', description: 'v2.3.1 deployed successfully', source: 'Vercel', timestamp: '1 hour ago', actor: 'CI/CD' },
  ],
  ai_summary: "You have 2 active tasks today. Sarah is waiting on your PR review for the onboarding flow. The staging deploy completed successfully — consider promoting to production. There's a Slack thread about the Q4 roadmap that needs your input.",
  connected_apps: [
    { id: '1', name: 'Slack', icon: 'slack', status: 'connected', lastSync: '2 min ago' },
    { id: '2', name: 'GitHub', icon: 'github', status: 'connected', lastSync: '5 min ago' },
    { id: '3', name: 'Notion', icon: 'notebook', status: 'disconnected' },
  ],
};

export const dashboardService = {
  getOverview: async (): Promise<DashboardData> => {
    try {
      const { data } = await api.get('/dashboard');
      return data;
    } catch {
      // Fallback to mock data during development
      return MOCK_DASHBOARD;
    }
  },
};
