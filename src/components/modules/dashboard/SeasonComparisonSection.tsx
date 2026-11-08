import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { DASHBOARD_SECTIONS, INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardSectionState } from '@/controllers/dashboard/useDashboardSection'
import type { DashboardBySeason } from '@/types/dashboard'
import { formatLoad, formatNumber } from '@/utils/formatNumber'

export function SeasonComparisonSection({
  state,
}: {
  state: DashboardSectionState<DashboardBySeason>
}) {
  return (
    <DashboardSection
      id="tablero-temporadas"
      {...DASHBOARD_SECTIONS.seasons}
      state={state}
      skeleton="table"
      isEmpty={(data) => data.seasons.length === 0}
      emptyMessage="No hay temporadas registradas."
      warnings={(data) => data.warnings}
    >
      {(data) => (
        <div className="overflow-x-auto rounded-2xl glass-subtle p-2">
          <DataTableSimple
            caption="Comparación entre temporadas"
            headers={[
              'Temporada',
              'Deportistas',
              'Sesiones',
              'Partidos',
              'Carga media',
              'RPE medio',
              'Lesiones',
              'Índice de progreso',
              'Señalizaciones de talento',
            ]}
            rows={data.seasons.map((season) => [
              season.status === 'active' ? `${season.name} (activa)` : season.name,
              season.athletes,
              season.sessions,
              season.matches,
              season.avg_session_load === null
                ? INSUFFICIENT_DATA
                : formatLoad(season.avg_session_load),
              season.avg_rpe === null ? INSUFFICIENT_DATA : formatNumber(season.avg_rpe, 1),
              season.injuries,
              season.avg_progress_index === null
                ? INSUFFICIENT_DATA
                : formatNumber(season.avg_progress_index, 1),
              season.talent_flags,
            ])}
          />
        </div>
      )}
    </DashboardSection>
  )
}
