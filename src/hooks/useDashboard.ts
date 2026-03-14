import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getOverview,
    refetchInterval: 30000,
    staleTime: 10000,
  });
};
