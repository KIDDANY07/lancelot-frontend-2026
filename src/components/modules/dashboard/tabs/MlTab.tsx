import { CircleCheck, CircleX, FlaskConical, ShieldAlert } from 'lucide-react'
import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { PartToWholeDonut } from '@/components/charts/interactive/PartToWholeDonut'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { NEUTRAL_COLOR, SERIES_COLORS, STATUS_COLORS } from '@/constants/chartColors'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import { ML_ENGINE_MODE, type MlEngineMode } from '@/constants/enums'
import { READINESS_LABELS } from '@/constants/ml'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useMlTab } from '@/controllers/dashboard/useDashboardTabs'
import type { DashboardMlModelRow, ReadinessSummary } from '@/types/dashboard'
import { dayLabelLong } from '@/utils/dashboardFormat'
import { formatNumber, formatPercent } from '@/utils/formatNumber'

const LABEL_QUALITY: Record<string, string> = {
  labeled: 'Etiquetados',
  pending: 'Pendientes',
  unknown_mechanism: 'Mecanismo desconocido',
}

function engineLabel(mode: string | undefined) {
  return mode && mode in ML_ENGINE_MODE.labels
    ? ML_ENGINE_MODE.labels[mode as MlEngineMode]
    : (mode ?? '—')
}

function ReadinessCard({ title, readiness }: { title: string; readiness: ReadinessSummary }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5">
      <header>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className={readiness.ready ? 'text-sm text-risk-low' : 'text-sm text-risk-medium'}>
          {readiness.ready
            ? 'Se cumplen los mínimos de datos'
            : 'Aún no se cumplen los mínimos de datos'}
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {readiness.criteria.map((criterion) => {
          const share = criterion.minimum
            ? Math.min(100, (criterion.value / criterion.minimum) * 100)
            : 100
          return (
            <li key={criterion.code} className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  {criterion.met ? (
                    <CircleCheck aria-hidden="true" className="size-4 text-risk-low" />
                  ) : (
                    <CircleX aria-hidden="true" className="size-4 text-risk-medium" />
                  )}
                  {READINESS_LABELS[criterion.code] ?? criterion.code}
                </span>
                <span className="text-muted-foreground">
                  {criterion.value} de {criterion.minimum}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(share)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={READINESS_LABELS[criterion.code] ?? criterion.code}
              >
                <div
                  className={
                    criterion.met
                      ? 'h-full rounded-full bg-risk-low'
                      : 'h-full rounded-full bg-risk-medium'
                  }
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function MlTab({ scope }: { scope: DashboardScopeState }) {
  const ml = useMlTab(scope)

  return (
    <DashboardSection
      id="tablero-ml"
      title="Modelo de aprendizaje automático"
      description="Cómo está funcionando el modelo frente a las reglas y si los datos alcanzan para confiar en él."
      state={ml}
      skeleton="cards"
      warnings={(data) =>
        data.warnings.filter(
          (warning) =>
            !warning.startsWith('Modo sombra') && !warning.startsWith('El registro de modelos'),
        )
      }
    >
      {(data) => {
        const engine = data.engine?.engine
        const models = data.models.map((model) => ({
          ...model,
          label: `${model.task === 'talent' ? 'Talento' : 'Lesión'} · ${model.created ?? ''}${model.is_active ? ' (activo)' : ''}`,
        }))
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2" aria-label="Advertencias del modelo">
              {engine === 'shadow' && (
                <div
                  role="note"
                  className="flex items-start gap-3 rounded-2xl border border-risk-medium/40 bg-risk-medium/10 px-4 py-3"
                >
                  <FlaskConical
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-risk-medium"
                  />
                  <p className="text-sm">
                    <span className="font-semibold">Modo sombra.</span> El modelo calcula una
                    probabilidad estimada en segundo plano, pero no genera alertas: las alertas
                    salen de las reglas.
                  </p>
                </div>
              )}
              <div
                role="note"
                className="flex items-start gap-3 rounded-2xl border border-risk-medium/40 bg-risk-medium/10 px-4 py-3"
              >
                <ShieldAlert
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-risk-medium"
                />
                <p className="text-sm">
                  <span className="font-semibold">Origen sin verificar.</span> El registro de
                  modelos no guarda si un modelo se entrenó con datos sintéticos o de demostración.
                  Interpreta sus resultados con cautela.
                </p>
              </div>
            </div>
            {data.engine && (
              <p className="text-sm text-muted-foreground">
                Motor de riesgo:{' '}
                <span className="font-semibold text-foreground">
                  {engineLabel(data.engine.engine)}
                </span>{' '}
                · Motor de talento:{' '}
                <span className="font-semibold text-foreground">
                  {engineLabel(data.engine.talent_engine)}
                </span>{' '}
                · Umbrales de probabilidad estimada: medio desde{' '}
                {formatPercent((data.engine.prob_medium_threshold ?? 0) * 100, 1)} y alto desde{' '}
                {formatPercent((data.engine.prob_high_threshold ?? 0) * 100, 1)}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InteractiveBarChart<DashboardMlModelRow & { label: string }>
                title="Modelos frente a las reglas"
                description="PR-AUC en la prueba: qué tan bien encuentra los casos positivos (más alto es mejor)."
                data={models}
                categoryKey="label"
                horizontal
                series={[
                  { key: 'pr_auc', label: 'Modelo', color: SERIES_COLORS[0] },
                  { key: 'rules_pr_auc', label: 'Reglas', color: NEUTRAL_COLOR },
                ]}
                formatValue={(value) =>
                  value === null ? INSUFFICIENT_DATA : formatNumber(value, 3)
                }
                valueDomain={[0, 1]}
              />
              <InteractiveBarChart
                title="Predicciones de riesgo por día"
                description="Nivel según la probabilidad estimada de lesión sin contacto en 7 días."
                data={data.predictions_daily}
                categoryKey="key"
                formatCategory={(value) => dayLabelLong(value)}
                stacked
                series={[
                  { key: 'bajo', label: 'Bajo', color: STATUS_COLORS.low },
                  { key: 'medio', label: 'Medio', color: STATUS_COLORS.medium },
                  { key: 'alto', label: 'Alto', color: STATUS_COLORS.high },
                ]}
                formatValue={(value) => formatNumber(value, 0)}
                integerValues
                emptyMessage={`${INSUFFICIENT_DATA}: el modelo no hizo predicciones en el periodo.`}
              />
              <InteractiveBarChart
                title="Distribución de la probabilidad estimada"
                description="Cuántas predicciones cayeron en cada rango de probabilidad."
                data={data.probability_distribution.map((bin) => ({
                  ...bin,
                  label: `${formatPercent(bin.from * 100, 3)}`,
                }))}
                categoryKey="label"
                series={[{ key: 'total', label: 'Predicciones', color: SERIES_COLORS[0] }]}
                formatValue={(value) => formatNumber(value, 0)}
                integerValues
                emptyMessage={`${INSUFFICIENT_DATA}: el modelo no hizo predicciones en el periodo.`}
              />
              <PartToWholeDonut
                title="Datos diarios para entrenar"
                description="Snapshots diarios según si ya se sabe si hubo lesión en los 7 días siguientes."
                slices={data.labels.map((row, index) => ({
                  key: row.label_quality,
                  label: LABEL_QUALITY[row.label_quality] ?? row.label_quality,
                  value: row.total,
                  color: index < SERIES_COLORS.length ? SERIES_COLORS[index] : NEUTRAL_COLOR,
                }))}
                centerLabel="días-deportista"
              />
              <ReadinessCard
                title="Mínimos para el modelo de lesión"
                readiness={data.readiness.injury}
              />
              <ReadinessCard
                title="Mínimos para el modelo de talento"
                readiness={data.readiness.talent}
              />
              {data.talent_predictions && (
                <div className="xl:col-span-2">
                  <InteractiveBarChart
                    title="Probabilidad estimada de ascenso (talento)"
                    description={`${
                      data.talent_predictions.is_selected_season
                        ? 'Temporada elegida'
                        : `La temporada elegida no tiene predicciones; se muestran las de ${data.talent_predictions.season_name}`
                    }. ${data.talent_predictions.above_threshold} de ${data.talent_predictions.total} superan el umbral; las reglas marcaron ${data.talent_predictions.rules_flagged}.`}
                    data={data.talent_predictions.distribution.map((bin) => ({
                      ...bin,
                      label: `${formatPercent(bin.from * 100, 0)}–${formatPercent(bin.to * 100, 0)}`,
                    }))}
                    categoryKey="label"
                    series={[{ key: 'total', label: 'Deportistas', color: SERIES_COLORS[1] }]}
                    formatValue={(value) => formatNumber(value, 0)}
                    integerValues
                  />
                </div>
              )}
            </div>
          </div>
        )
      }}
    </DashboardSection>
  )
}
