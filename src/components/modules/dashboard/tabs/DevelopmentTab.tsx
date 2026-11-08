import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { InteractiveLineChart } from '@/components/charts/interactive/InteractiveLineChart'
import { PartToWholeDonut } from '@/components/charts/interactive/PartToWholeDonut'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { NEUTRAL_COLOR, SERIES_COLORS, STATUS_COLORS } from '@/constants/chartColors'
import { HUMAN_REVIEW_NOTE, INSUFFICIENT_DATA } from '@/constants/dashboard'
import { TALENT_FLAG_SOURCE, type TalentFlagSource } from '@/constants/enums'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useDevelopmentTab } from '@/controllers/dashboard/useDashboardTabs'
import type { DashboardDevelopment } from '@/types/dashboard'
import { monthLabel } from '@/utils/dashboardFormat'
import { formatNumber } from '@/utils/formatNumber'

const PHYSICAL_METRICS = [
  { key: 'vo2max', label: 'VO₂máx estimado', unit: 'ml/kg/min', digits: 1, higherIsBetter: true },
  { key: 'speed_20m', label: 'Velocidad 20 m', unit: 's', digits: 2, higherIsBetter: false },
  { key: 'weight_kg', label: 'Peso', unit: 'kg', digits: 1, higherIsBetter: null },
  { key: 'height_cm', label: 'Talla', unit: 'cm', digits: 1, higherIsBetter: null },
] as const

type Stage = DashboardDevelopment['physical_by_stage'][number]

function PhysicalComparison({ stages }: { stages: Stage[] }) {
  const first = stages[0]
  const last = stages[stages.length - 1]
  if (!first)
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {INSUFFICIENT_DATA}: no hay evaluaciones físicas en el periodo.
      </p>
    )
  return (
    <section className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5">
      <header>
        <h3 className="text-base font-semibold">Evaluación física</h3>
        <p className="text-sm text-muted-foreground">
          Promedio de la evaluación {first.label.toLowerCase()} ({first.evaluations}) frente a la{' '}
          {last.label.toLowerCase()} ({last.evaluations}).
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PHYSICAL_METRICS.map((metric) => {
          const before = first[metric.key]
          const after = last[metric.key]
          const delta = before !== null && after !== null && first !== last ? after - before : null
          const better =
            delta === null || metric.higherIsBetter === null || delta === 0
              ? null
              : metric.higherIsBetter === delta > 0
          const Icon =
            delta === null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight
          return (
            <li key={metric.key} className="flex flex-col gap-1 rounded-xl bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-xl font-semibold">
                {after === null
                  ? INSUFFICIENT_DATA
                  : `${formatNumber(after, metric.digits)} ${metric.unit}`}
              </p>
              {delta !== null && (
                <p
                  className={
                    better === null
                      ? 'flex items-center gap-1 text-xs text-muted-foreground'
                      : better
                        ? 'flex items-center gap-1 text-xs text-risk-low'
                        : 'flex items-center gap-1 text-xs text-risk-high'
                  }
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                  {delta > 0 ? '+' : ''}
                  {formatNumber(delta, metric.digits)} {metric.unit} desde la evaluación{' '}
                  {first.label.toLowerCase()}
                  {better !== null && (
                    <span className="sr-only">{better ? ' (mejora)' : ' (empeora)'}</span>
                  )}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function DevelopmentTab({ scope }: { scope: DashboardScopeState }) {
  const development = useDevelopmentTab(scope)

  return (
    <DashboardSection
      id="tablero-desarrollo"
      title={scope.isAthlete ? 'Tu desarrollo' : 'Desarrollo y talento'}
      description="Evaluaciones técnicas y físicas, índice de progreso, señalizaciones de talento y objetivos de desarrollo."
      state={development}
      skeleton="cards"
      warnings={(data) => data.warnings}
    >
      {(data) => {
        const indicators = data.technical_by_indicator.map((row) => ({
          indicator: row.indicator,
          tecnica: row.dimension === 'tecnica' ? row.avg_score : null,
          tactica: row.dimension === 'tactica' ? row.avg_score : null,
        }))
        const progress = data.progress
        const delta =
          progress && progress.index_value !== null && progress.previous_index !== null
            ? progress.index_value - progress.previous_index
            : null
        return (
          <div className="flex flex-col gap-4">
            {progress && (
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-2xl glass-subtle p-4">
                <p className="text-sm text-muted-foreground">
                  Índice de progreso medio ({progress.athletes} deportistas)
                </p>
                <p className="text-3xl font-semibold">
                  {progress.index_value === null
                    ? INSUFFICIENT_DATA
                    : formatNumber(progress.index_value, 1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {delta === null
                    ? 'Sin datos de la temporada anterior para comparar'
                    : `${delta >= 0 ? '+' : ''}${formatNumber(delta, 1)} frente a la temporada anterior (${formatNumber(progress.previous_index, 1)})`}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InteractiveBarChart
                title="Evaluación técnica y táctica por indicador"
                description="Puntaje promedio de cada indicador (escala de 1 a 10)."
                data={indicators}
                categoryKey="indicator"
                horizontal
                series={[
                  { key: 'tecnica', label: 'Técnica', color: SERIES_COLORS[0] },
                  { key: 'tactica', label: 'Táctica', color: SERIES_COLORS[1] },
                ]}
                stacked
                formatValue={(value) => (value === null ? '—' : formatNumber(value, 2))}
              />
              <div className="flex flex-col gap-4">
                <InteractiveLineChart
                  title="Evolución de las evaluaciones"
                  description="Promedio mensual de los puntajes técnicos y tácticos."
                  data={data.technical_monthly}
                  xKey="key"
                  formatX={monthLabel}
                  series={[
                    { key: 'tecnica', label: 'Técnica', color: SERIES_COLORS[0] },
                    { key: 'tactica', label: 'Táctica', color: SERIES_COLORS[1] },
                  ]}
                />
                <PhysicalComparison stages={data.physical_by_stage} />
              </div>
              {progress && (
                <InteractiveBarChart
                  title="Componentes del índice de progreso"
                  description="Promedio de cada componente (0 a 100)."
                  helpTerm="progressIndex"
                  data={progress.components}
                  categoryKey="label"
                  horizontal
                  series={[{ key: 'value', label: 'Puntaje', color: SERIES_COLORS[0] }]}
                  formatValue={(value) =>
                    value === null ? INSUFFICIENT_DATA : formatNumber(value, 1)
                  }
                />
              )}
              {progress && !scope.isAthlete && (
                <InteractiveBarChart
                  title="Distribución del índice de progreso"
                  description="Cuántos deportistas hay en cada tramo de 5 puntos."
                  data={progress.distribution
                    .filter((bin) => bin.from >= 40 || bin.total > 0)
                    .map((bin) => ({ ...bin, label: `${bin.from}–${bin.to}` }))}
                  categoryKey="label"
                  series={[{ key: 'total', label: 'Deportistas', color: SERIES_COLORS[1] }]}
                  formatValue={(value) => formatNumber(value, 0)}
                  integerValues
                />
              )}
              {data.talent_flags && (
                <InteractiveBarChart
                  title="Señalizaciones de talento"
                  description={HUMAN_REVIEW_NOTE}
                  data={data.talent_flags.map((row) => ({
                    ...row,
                    label:
                      row.source in TALENT_FLAG_SOURCE.labels
                        ? TALENT_FLAG_SOURCE.labels[row.source as TalentFlagSource]
                        : row.source,
                  }))}
                  categoryKey="label"
                  stacked
                  series={[
                    { key: 'open', label: 'Pendientes', color: SERIES_COLORS[0] },
                    { key: 'reviewed', label: 'Aceptadas', color: SERIES_COLORS[1] },
                    { key: 'dismissed', label: 'Descartadas', color: NEUTRAL_COLOR },
                  ]}
                  formatValue={(value) => formatNumber(value, 0)}
                  integerValues
                />
              )}
              {data.objectives && (
                <PartToWholeDonut
                  title={
                    scope.isAthlete ? 'Tus objetivos de desarrollo' : 'Objetivos de desarrollo'
                  }
                  description={
                    data.objectives.overdue
                      ? `${data.objectives.overdue} objetivos abiertos ya pasaron su fecha meta.`
                      : undefined
                  }
                  slices={[
                    {
                      key: 'achieved',
                      label: 'Cumplidos',
                      value: data.objectives.achieved,
                      color: STATUS_COLORS.low,
                    },
                    {
                      key: 'open',
                      label: 'En curso',
                      value: data.objectives.open,
                      color: SERIES_COLORS[0],
                    },
                    {
                      key: 'missed',
                      label: 'No cumplidos',
                      value: data.objectives.missed,
                      color: STATUS_COLORS.high,
                    },
                  ]}
                  centerLabel="objetivos"
                />
              )}
            </div>
          </div>
        )
      }}
    </DashboardSection>
  )
}
