import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { APP_MODULES } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import type { DashboardFilters } from '@/types/dashboard'

export function useDashboardScope() {
  const {
    season,
    seasons,
    category,
    setCategoryId,
    setSeasonId,
    isLoading: contextLoading,
  } = useAppContext()
  const { role, can } = useRole()
  const navigate = useNavigate()
  const isAthlete = role === 'DEPORTISTA'
  const seasonId = season?.id_season
  const categoryId = isAthlete ? undefined : category?.id_category

  const params = useMemo<DashboardFilters>(
    () => ({ id_season: seasonId, id_category: categoryId }),
    [seasonId, categoryId],
  )
  const seasonParams = useMemo<DashboardFilters>(() => ({ id_category: categoryId }), [categoryId])

  return {
    ready: !contextLoading && role !== null,
    isAthlete,
    params,
    seasonParams,
    seasonName: season?.name ?? null,
    categoryName: isAthlete ? null : (category?.name ?? null),
    categoryId: categoryId ?? null,
    seasons,
    can,
    selectCategory: setCategoryId,
    selectSeason: (idSeason: number) => setSeasonId(idSeason),
    openAthlete: (idUser: number) => navigate(`${APP_MODULES.athletes.path}/${idUser}`),
  }
}

export type DashboardScopeState = ReturnType<typeof useDashboardScope>
