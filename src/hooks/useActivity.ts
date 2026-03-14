import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activityService';

export const useActivity = () => {
  return useQuery({
    queryKey: ['activity'],
    queryFn: activityService.getActivity,
    staleTime: 10000,
  });
};
