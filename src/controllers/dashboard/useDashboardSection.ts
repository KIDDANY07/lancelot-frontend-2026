import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import type { DashboardFilters } from '@/types/dashboard'
import { parseApiError } from '@/utils/parseApiError'

export interface DashboardSectionState<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | undefined
  retry: () => void
}

export function useDashboardSection<T>(
  section: string,
  fetcher: (filters: DashboardFilters) => Promise<T>,
  filters: DashboardFilters,
  enabled: boolean,
): DashboardSectionState<T> {
  const query = useQuery({
    queryKey: queryKeys.dashboard.section(section, { ...filters }),
    queryFn: () => fetcher(filters),
    enabled,
    placeholderData: keepPreviousData,
  })
  return {
    data: query.data,
    isLoading: enabled && query.isPending,
    isFetching: query.isFetching,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
  }
}
