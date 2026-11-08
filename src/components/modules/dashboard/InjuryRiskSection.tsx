import { Link } from 'react-router'
import { LevelBadge } from '@/components/common/LevelBadge'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { DASHBOARD_SECTIONS } from '@/constants/dashboard'
import { APP_MODULES } from '@/constants/navigation'
import type { DashboardSectionState } from '@/controllers/dashboard/useDashboardSection'
import type { DashboardInjuryRisk } from '@/types/dashboard'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

export function InjuryRiskSection({
  state,
}: {
  state: DashboardSectionState<DashboardInjuryRisk>
}) {
  return (
    <DashboardSection
      id="tablero-riesgo"
      {...DASHBOARD_SECTIONS.injuryRisk}
      state={state}
      skeleton="list"
      warnings={(data) => data.warnings}
    >
      {(data) =>
        data.athletes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Ningún deportista tiene alertas de riesgo medio o alto sin revisar en este periodo.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {data.counts.alto} con riesgo alto · {data.counts.medio} con riesgo medio. Revísalos
              en el módulo de Salud.
            </p>
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {data.athletes.map((athlete) => (
                <li
                  key={athlete.id_user}
                  className="flex flex-col gap-2 rounded-2xl glass-subtle p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`${APP_MODULES.athletes.path}/${athlete.id_user}`}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      {athlete.athlete}
                    </Link>
                    <LevelBadge level={athlete.risk_level} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {athlete.open_days} {athlete.open_days === 1 ? 'día' : 'días'} con alerta · la
                    última el {formatDate(athlete.last_date)}
                    {athlete.acwr !== null && ` · ACWR ${formatNumber(athlete.acwr, 2)}`}
                    {athlete.origin === 'modelo' && ' · alerta del modelo de ML'}
                  </p>
                  {athlete.factors.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Motivos de la alerta">
                      {athlete.factors.map((factor) => (
                        <li key={factor} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                          {factor}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    </DashboardSection>
  )
}
