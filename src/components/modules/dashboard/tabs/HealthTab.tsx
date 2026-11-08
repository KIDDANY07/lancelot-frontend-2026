import { BellRing, CalendarX, FileCheck, HeartPulse } from 'lucide-react'
import { KpiCard } from '@/components/common/KpiCard'
import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { PartToWholeDonut } from '@/components/charts/interactive/PartToWholeDonut'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { InjuryRiskSection } from '@/components/modules/dashboard/InjuryRiskSection'
import { NEUTRAL_COLOR, SERIES_COLORS, STATUS_COLORS } from '@/constants/chartColors'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useHealthTab } from '@/controllers/dashboard/useDashboardTabs'
import { monthLabel, weekLabel } from '@/utils/dashboardFormat'
import { formatNumber } from '@/utils/formatNumber'

const whole = (value: number | null) => formatNumber(value, 0)
const SEVERITY_LABELS = { leve: 'Leve', moderada: 'Moderada', severa: 'Severa' } as const
const CONSENT_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  granted: 'Otorgado',
  revoked: 'Revocado',
}

export function HealthTab({ scope }: { scope: DashboardScopeState }) {
  const { health, injuryRisk } = useHealthTab(scope)

  return (
    <div className="flex flex-col gap-8">
      <DashboardSection
        id="tablero-salud"
        title="Lesiones y alertas"
        description="Lesiones del periodo, cuánto tiempo de baja causaron y cómo evolucionaron las alertas. No se muestran diagnósticos."
        state={health}
        skeleton="cards"
        warnings={(data) => data.warnings}
      >
        {(data) => {
          const injuries = data.injuries_by_severity.reduce((sum, row) => sum + row.total, 0)
          const daysLost = data.injuries_by_severity.reduce(
            (sum, row) => sum + row.total_days_lost,
            0,
          )
          const fatigue = data.fatigue_weekly.reduce(
            (sum, row) => sum + row.overload + row.underload,
            0,
          )
          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Lesiones en el periodo" value={injuries} icon={HeartPulse} />
                <KpiCard
                  label="Días de baja"
                  value={formatNumber(daysLost, 0)}
                  hint={
                    injuries
                      ? `${formatNumber(daysLost / injuries, 1)} días por lesión`
                      : INSUFFICIENT_DATA
                  }
                  icon={CalendarX}
                />
                <KpiCard
                  label="Estado actual de las lesiones"
                  value={data.injury_status.active + data.injury_status.recovering}
                  hint={`${data.injury_status.active} activas · ${data.injury_status.recovering} en reintegro · ${data.injury_status.recovered} recuperadas`}
                  icon={HeartPulse}
                />
                <KpiCard
                  label="Alertas de fatiga generadas"
                  value={fatigue}
                  hint={`${data.fatigue_weekly.reduce((sum, row) => sum + row.open, 0)} siguen sin revisar`}
                  icon={BellRing}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <InteractiveBarChart
                  title="Lesiones por mes"
                  description="Según el mecanismo registrado."
                  data={data.injuries_monthly}
                  categoryKey="key"
                  formatCategory={monthLabel}
                  stacked
                  series={[
                    { key: 'non_contact', label: 'Sin contacto', color: SERIES_COLORS[0] },
                    { key: 'contact', label: 'Con contacto', color: SERIES_COLORS[1] },
                    { key: 'unknown', label: 'Sin registrar', color: NEUTRAL_COLOR },
                  ]}
                  formatValue={whole}
                  integerValues
                />
                <InteractiveBarChart
                  title="Lesiones por zona del cuerpo"
                  description="Por severidad. Oculta niveles con la leyenda."
                  data={data.injuries_by_body_part}
                  categoryKey="body_part"
                  formatCategory={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  horizontal
                  stacked
                  series={[
                    { key: 'leve', label: 'Leve', color: STATUS_COLORS.low },
                    { key: 'moderada', label: 'Moderada', color: STATUS_COLORS.medium },
                    { key: 'severa', label: 'Severa', color: STATUS_COLORS.high },
                  ]}
                  formatValue={whole}
                  integerValues
                />
                <InteractiveBarChart
                  title="Días de baja promedio por severidad"
                  data={data.injuries_by_severity.map((row) => ({
                    ...row,
                    label: SEVERITY_LABELS[row.severity],
                  }))}
                  categoryKey="label"
                  series={[
                    { key: 'avg_days_lost', label: 'Días de baja', color: SERIES_COLORS[0] },
                  ]}
                  formatValue={(value) =>
                    value === null ? INSUFFICIENT_DATA : `${formatNumber(value, 1)} días`
                  }
                />
                <InteractiveBarChart
                  title="Alertas de fatiga por semana"
                  description={`Sobrecarga: ACWR alto. Subcarga: ACWR menor que ${formatNumber(data.underload_threshold, 2)}.`}
                  data={data.fatigue_weekly}
                  categoryKey="key"
                  formatCategory={weekLabel}
                  stacked
                  series={[
                    { key: 'overload', label: 'Sobrecarga', color: STATUS_COLORS.high },
                    { key: 'underload', label: 'Subcarga', color: STATUS_COLORS.neutral },
                  ]}
                  formatValue={whole}
                  integerValues
                />
                <div className="xl:col-span-2">
                  <InteractiveBarChart
                    title="Alertas de riesgo de lesión por semana"
                    description="Días-deportista con riesgo medio o alto según las evaluaciones."
                    data={data.risk_weekly}
                    categoryKey="key"
                    formatCategory={weekLabel}
                    stacked
                    series={[
                      { key: 'medio', label: 'Riesgo medio', color: STATUS_COLORS.medium },
                      { key: 'alto', label: 'Riesgo alto', color: STATUS_COLORS.high },
                    ]}
                    formatValue={whole}
                    integerValues
                  />
                </div>
                {data.health_records && (
                  <PartToWholeDonut
                    title="Registros de salud por tipo"
                    description="Solo visible para administración y el encargado de salud."
                    slices={Object.entries(
                      data.health_records.reduce<Record<string, number>>((acc, row) => {
                        acc[row.condition_type] = (acc[row.condition_type] ?? 0) + row.total
                        return acc
                      }, {}),
                    ).map(([label, value], index) => ({
                      key: label,
                      label,
                      value,
                      color: index < SERIES_COLORS.length ? SERIES_COLORS[index] : NEUTRAL_COLOR,
                    }))}
                    centerLabel="registros"
                  />
                )}
                {data.consents && (
                  <div className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <FileCheck aria-hidden="true" className="size-5 text-primary" />
                      Consentimientos de menores
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.consents.minors} deportistas menores de edad ·{' '}
                      <span
                        className={
                          data.consents.minors_without_consent ? 'font-semibold text-risk-high' : ''
                        }
                      >
                        {data.consents.minors_without_consent} sin consentimiento otorgado
                      </span>
                    </p>
                    <ul className="flex flex-wrap gap-2 text-sm">
                      {data.consents.by_status.map((row) => (
                        <li key={row.status} className="rounded-full bg-muted px-3 py-1">
                          {CONSENT_LABELS[row.status] ?? row.status}: {row.total}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        }}
      </DashboardSection>
      <InjuryRiskSection state={injuryRisk} />
    </div>
  )
}
