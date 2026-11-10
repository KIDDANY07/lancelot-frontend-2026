import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useDashboardSection } from '@/controllers/dashboard/useDashboardSection'
import { dashboardService } from '@/services/dashboardService'
import type { DashboardFilters } from '@/types/dashboard'

export function useGeneralTab(scope: DashboardScopeState) {
  const team = scope.can('viewDashboardTeam')
  return {
    team,
    overview: useDashboardSection('overview', dashboardService.overview, scope.params, scope.ready),
    byCategory: useDashboardSection(
      'by-category',
      dashboardService.byCategory,
      scope.params,
      scope.ready && team,
    ),
    bySeason: useDashboardSection(
      'by-season',
      dashboardService.bySeason,
      scope.seasonParams,
      scope.ready && team,
    ),
  }
}

export function useTrainingTab(scope: DashboardScopeState) {
  return {
    load: useDashboardSection('load', dashboardService.load, scope.params, scope.ready),
    training: useDashboardSection('training', dashboardService.training, scope.params, scope.ready),
  }
}

export function useMatchesTab(scope: DashboardScopeState) {
  return useDashboardSection('matches', dashboardService.matches, scope.params, scope.ready)
}

export function useHealthTab(scope: DashboardScopeState) {
  return {
    health: useDashboardSection('health', dashboardService.health, scope.params, scope.ready),
    injuryRisk: useDashboardSection(
      'injury-risk',
      dashboardService.injuryRisk,
      scope.params,
      scope.ready,
    ),
  }
}

export function useDevelopmentTab(scope: DashboardScopeState) {
  return useDashboardSection('development', dashboardService.development, scope.params, scope.ready)
}

export function useMlTab(scope: DashboardScopeState) {
  return useDashboardSection('ml', dashboardService.ml, scope.params, scope.ready)
}

const ALL_HISTORY: DashboardFilters = {}

export function useSummaryTab(scope: DashboardScopeState) {
  return useDashboardSection('summary', dashboardService.summary, ALL_HISTORY, scope.ready)
}
