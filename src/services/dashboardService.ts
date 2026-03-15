import api from './api';
import type { DashboardData } from '@/types/dashboard';

export const dashboardService = {
  getOverview: async (): Promise<DashboardData> => {
    const { data } = await api.get('/dashboard');
    return data;
  },
};
