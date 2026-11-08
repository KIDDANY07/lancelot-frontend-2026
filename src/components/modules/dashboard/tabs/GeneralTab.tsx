import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { SmallMultiples } from '@/components/charts/interactive/SmallMultiples'
import { CategorySummarySection } from '@/components/modules/dashboard/CategorySummarySection'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { OverviewSection } from '@/components/modules/dashboard/OverviewSection'
import { SeasonComparisonSection } from '@/components/modules/dashboard/SeasonComparisonSection'
import { SERIES_COLORS, STATUS_COLORS } from '@/constants/chartColors'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useGeneralTab } from '@/controllers/dashboard/useDashboardTabs'
import type { CategorySummary, SeasonSummary } from '@/types/dashboard'
import { formatLoad, formatNumber } from '@/utils/formatNumber'

const format = (digits: number) => (value: number | null) =>
  value === null ? INSUFFICIENT_DATA : formatNumber(value, digits)

export function GeneralTab({ scope }: { scope: DashboardScopeState }) {
  const { team, overview, byCategory, bySeason } = useGeneralTab(scope)

  return (
    <div className="flex flex-col gap-8">
      <OverviewSection state={overview} />
      {team && (
        <DashboardSection
          id="tablero-categorias-grafico"
          title="Categorías de un vistazo"
          description="Toca una barra para filtrar todo el tablero por esa categoría."
          state={byCategory}
          skeleton="list"
          isEmpty={(data) => data.categories.length === 0}
        >
          {(data) => (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InteractiveBarChart<CategorySummary>
                title="Deportistas y alertas por categoría"
                description="Deportistas asignados, deportistas en riesgo y lesiones en la temporada."
                data={data.categories}
                categoryKey="name"
                horizontal
                series={[
                  { key: 'athletes', label: 'Deportistas', color: SERIES_COLORS[0] },
                  { key: 'athletes_at_risk', label: 'En riesgo', color: STATUS_COLORS.high },
                  { key: 'injuries', label: 'Lesiones', color: SERIES_COLORS[1] },
                ]}
                formatValue={format(0)}
                onSelect={(row) => scope.selectCategory(row.id_category)}
                selectHint="Clic para filtrar por esta categoría"
              />
              <InteractiveBarChart<CategorySummary>
                title="Índice de progreso por categoría"
                description="Promedio de los deportistas cuya categoría base es esta (0 a 100)."
                helpTerm="progressIndex"
                data={data.categories}
                categoryKey="name"
                horizontal
                series={[
                  {
                    key: 'avg_progress_index',
                    label: 'Índice de progreso',
                    color: SERIES_COLORS[0],
                  },
                ]}
                formatValue={format(1)}
                onSelect={(row) => scope.selectCategory(row.id_category)}
                selectHint="Clic para filtrar por esta categoría"
              />
            </div>
          )}
        </DashboardSection>
      )}
      {team && (
        <CategorySummarySection
          state={byCategory}
          selectedCategory={scope.categoryId}
          onSelectCategory={scope.selectCategory}
        />
      )}
      {team && (
        <DashboardSection
          id="tablero-temporadas-tendencia"
          title="Evolución entre temporadas"
          description="Cada mini gráfica muestra un indicador en todas las temporadas. Toca un punto para cambiar a esa temporada."
          state={bySeason}
          skeleton="cards"
          isEmpty={(data) => data.seasons.length === 0}
        >
          {(data) => (
            <SmallMultiples<SeasonSummary>
              data={data.seasons}
              xKey="name"
              selectedX={scope.seasonName}
              onSelect={(row) => scope.selectSeason(row.id_season)}
              metrics={[
                { key: 'sessions', label: 'Sesiones', format: format(0) },
                { key: 'matches', label: 'Partidos', format: format(0) },
                {
                  key: 'avg_session_load',
                  label: 'Carga media por sesión',
                  format: (value) => (value === null ? INSUFFICIENT_DATA : formatLoad(value)),
                },
                { key: 'avg_rpe', label: 'RPE medio', format: format(1) },
                { key: 'injuries', label: 'Lesiones', format: format(0) },
                { key: 'avg_progress_index', label: 'Índice de progreso', format: format(1) },
              ]}
            />
          )}
        </DashboardSection>
      )}
      {team && <SeasonComparisonSection state={bySeason} />}
    </div>
  )
}
