import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { InteractiveLineChart } from '@/components/charts/interactive/InteractiveLineChart'
import { PartToWholeDonut } from '@/components/charts/interactive/PartToWholeDonut'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { SERIES_COLORS, STATUS_COLORS } from '@/constants/chartColors'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useTrainingTab } from '@/controllers/dashboard/useDashboardTabs'
import type { LoadSeriesPoint, TrainingByType } from '@/types/dashboard'
import { dayLabelLong, weekLabel, weekLabelLong } from '@/utils/dashboardFormat'
import { formatLoad, formatNumber } from '@/utils/formatNumber'

interface ZoneRow extends Record<string, unknown> {
  period: string
  subcarga: number
  optima: number
  precaucion: number
  sobrecarga: number
}

export function TrainingTab({ scope }: { scope: DashboardScopeState }) {
  const { load, training } = useTrainingTab(scope)

  return (
    <div className="flex flex-col gap-8">
      <DashboardSection
        id="tablero-carga"
        title="Carga y ACWR"
        description="La carga y el ACWR van en gráficas separadas porque se miden en escalas distintas."
        state={load}
        skeleton="list"
        warnings={(data) => data.warnings}
      >
        {(data) => {
          const weekly = data.granularity === 'week'
          const formatX = weekLabel
          const formatLong = weekly ? weekLabelLong : dayLabelLong
          const zones: ZoneRow[] = data.series.map((point) => ({
            period: point.period,
            ...point.acwr_zones,
          }))
          return (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InteractiveBarChart<LoadSeriesPoint>
                title={weekly ? 'Carga semanal por deportista' : 'Carga diaria por deportista'}
                description="Suma del session-RPE (RPE × minutos) entre los deportistas que entrenaron, en UA."
                helpTerm="trainingLoad"
                data={data.series}
                categoryKey="period"
                formatCategory={formatX}
                series={[
                  {
                    key: 'load_per_athlete',
                    label: 'Carga por deportista',
                    color: SERIES_COLORS[0],
                  },
                ]}
                formatValue={(value) => (value === null ? 'Sin cargas' : formatLoad(value))}
              />
              <InteractiveLineChart<LoadSeriesPoint>
                title="ACWR promedio"
                description="Relación entre la carga de 7 y de 28 días; las franjas son las zonas configuradas."
                helpTerm="acwr"
                data={data.series}
                xKey="period"
                formatX={formatX}
                formatXLong={formatLong}
                series={[{ key: 'acwr_avg', label: 'ACWR promedio', color: SERIES_COLORS[0] }]}
                zones={[
                  {
                    key: 'sub',
                    label: `Subcarga (< ${formatNumber(data.zones.low_min, 2)})`,
                    from: 0,
                    to: data.zones.low_min,
                    color: STATUS_COLORS.neutral,
                  },
                  {
                    key: 'opt',
                    label: `Óptima (${formatNumber(data.zones.low_min, 2)} – ${formatNumber(data.zones.low_max, 2)})`,
                    from: data.zones.low_min,
                    to: data.zones.low_max,
                    color: STATUS_COLORS.low,
                  },
                  {
                    key: 'pre',
                    label: `Precaución (hasta ${formatNumber(data.zones.medium_max, 2)})`,
                    from: data.zones.low_max,
                    to: data.zones.medium_max,
                    color: STATUS_COLORS.medium,
                  },
                  {
                    key: 'sob',
                    label: `Sobrecarga (> ${formatNumber(data.zones.medium_max, 2)})`,
                    from: data.zones.medium_max,
                    to: 99,
                    color: STATUS_COLORS.high,
                  },
                ]}
              />
              <div className="xl:col-span-2">
                <InteractiveBarChart<ZoneRow>
                  title="Días-deportista en cada zona de ACWR"
                  description="Cuántos días-deportista cayeron en cada zona. Oculta zonas con la leyenda."
                  data={zones}
                  categoryKey="period"
                  formatCategory={formatX}
                  stacked
                  series={[
                    { key: 'subcarga', label: 'Subcarga', color: STATUS_COLORS.neutral },
                    { key: 'optima', label: 'Zona óptima', color: STATUS_COLORS.low },
                    { key: 'precaucion', label: 'Precaución', color: STATUS_COLORS.medium },
                    { key: 'sobrecarga', label: 'Sobrecarga', color: STATUS_COLORS.high },
                  ]}
                  formatValue={(value) => formatNumber(value, 0)}
                  integerValues
                />
              </div>
            </div>
          )
        }}
      </DashboardSection>

      <DashboardSection
        id="tablero-sesiones"
        title="Sesiones y esfuerzo"
        description="Tipos de sesión, días de entrenamiento y cómo se repartió el esfuerzo percibido."
        state={training}
        skeleton="cards"
        warnings={(data) => data.warnings}
      >
        {(data) => (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PartToWholeDonut
              title="Sesiones por tipo"
              slices={data.by_type.map((row, index) => ({
                key: row.type,
                label: row.label,
                value: row.sessions,
                color: SERIES_COLORS[index % SERIES_COLORS.length],
              }))}
              centerLabel="sesiones"
            />
            <InteractiveBarChart<TrainingByType>
              title="Carga media por tipo de sesión"
              description="Promedio del session-RPE de cada carga registrada, en UA."
              data={data.by_type}
              categoryKey="label"
              horizontal
              series={[{ key: 'avg_session_load', label: 'Carga media', color: SERIES_COLORS[0] }]}
              formatValue={(value) => (value === null ? INSUFFICIENT_DATA : formatLoad(value))}
            />
            <InteractiveBarChart<TrainingByType>
              title="Minutos planificados y realizados"
              description="Duración planificada de la sesión frente a la que reportaron los deportistas."
              data={data.by_type}
              categoryKey="label"
              series={[
                { key: 'planned_minutes', label: 'Planificados', color: SERIES_COLORS[0] },
                { key: 'actual_minutes', label: 'Realizados', color: SERIES_COLORS[1] },
              ]}
              formatValue={(value) =>
                value === null ? INSUFFICIENT_DATA : `${formatNumber(value, 0)} min`
              }
            />
            <InteractiveBarChart
              title="Sesiones por día de la semana"
              data={data.by_weekday}
              categoryKey="label"
              formatCategory={(value) => value.slice(0, 3)}
              series={[{ key: 'sessions', label: 'Sesiones', color: SERIES_COLORS[0] }]}
              formatValue={(value) => formatNumber(value, 0)}
              integerValues
            />
            <div className="xl:col-span-2">
              <InteractiveBarChart
                title="Distribución del RPE"
                description="Cuántas cargas se reportaron con cada valor de esfuerzo percibido (escala de 1 a 10)."
                helpTerm="rpe"
                data={data.rpe_distribution}
                categoryKey="rpe"
                formatCategory={(value) => `RPE ${value}`}
                series={[{ key: 'total', label: 'Cargas', color: SERIES_COLORS[1] }]}
                formatValue={(value) => formatNumber(value, 0)}
                integerValues
              />
            </div>
          </div>
        )}
      </DashboardSection>
    </div>
  )
}
