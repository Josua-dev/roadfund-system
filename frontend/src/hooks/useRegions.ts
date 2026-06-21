import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Region } from '../types';

/**
 * Single source of truth for the regions list.
 *
 * Previously this exact fetch (queryKey ['regions'], same endpoint,
 * same shape) was copy-pasted into AdminUsers, AdminReports,
 * ProfilePage, SubmitReport, and MapView — five files, one request.
 * Anything that needs the region list imports this instead.
 */
export function useRegions() {
  return useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: async () => (await api.get('/regions')).data.data,
    staleTime: 1000 * 60 * 30, // regions don't change during a session
  });
}
