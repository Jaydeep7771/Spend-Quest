import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../services/api.js';

export function useQuests() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: async () => (await gamificationApi.quests()).data.data
  });
}
