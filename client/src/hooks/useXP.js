import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../services/api.js';

export function useXP() {
  return useQuery({
    queryKey: ['xp'],
    queryFn: async () => (await gamificationApi.xp()).data.data
  });
}
