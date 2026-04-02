import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../services/api.js';

export function useTransactions(params) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => (await transactionApi.list(params)).data.data
  });
}
