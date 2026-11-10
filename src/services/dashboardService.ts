import { apiClient } from '@/lib/apiClient'
import type {
  DashboardByCategory,
  DashboardDevelopment,
  DashboardHealth,
  DashboardMatches,
  DashboardMl,
  DashboardTraining,
  DashboardBySeason,
  DashboardFilters,
  DashboardInjuryRisk,
  DashboardLoad,
  DashboardOverview,
  DashboardSummary,
} from '@/types/dashboard'

interface DashboardEnvelope<T> {
  dashboard: T
}

function cleanParams(filters: DashboardFilters): DashboardFilters {
  const params: DashboardFilters = {}
  if (filters.id_season) params.id_season = filters.id_season
  if (filters.id_category) params.id_category = filters.id_category
  return params
}

async function get<T>(path: string, filters: DashboardFilters): Promise<T> {
  const { data } = await apiClient.http.get<DashboardEnvelope<T>>(path, {
    params: cleanParams(filters),
  })
  return data.dashboard
}

export const dashboardService = {
  overview(filters: DashboardFilters) {
    return get<DashboardOverview>('/dashboard/overview', filters)
  },

  load(filters: DashboardFilters) {
    return get<DashboardLoad>('/dashboard/load', filters)
  },

  byCategory(filters: DashboardFilters) {
    return get<DashboardByCategory>('/dashboard/by-category', filters)
  },

  bySeason(filters: DashboardFilters) {
    return get<DashboardBySeason>('/dashboard/by-season', { id_category: filters.id_category })
  },

  injuryRisk(filters: DashboardFilters) {
    return get<DashboardInjuryRisk>('/dashboard/injury-risk', filters)
  },

  training(filters: DashboardFilters) {
    return get<DashboardTraining>('/dashboard/training', filters)
  },

  matches(filters: DashboardFilters) {
    return get<DashboardMatches>('/dashboard/matches', filters)
  },

  health(filters: DashboardFilters) {
    return get<DashboardHealth>('/dashboard/health', filters)
  },

  development(filters: DashboardFilters) {
    return get<DashboardDevelopment>('/dashboard/development', filters)
  },

  ml(filters: DashboardFilters) {
    return get<DashboardMl>('/dashboard/ml', filters)
  },

  summary(filters: DashboardFilters) {
    return get<DashboardSummary>('/dashboard/summary', filters)
  },
}
