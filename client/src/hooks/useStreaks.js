import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../services/api.js';

export function useStreaks() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => (await gamificationApi.streaks()).data.data
  });
}
