import { Activity, BellRing, CalendarCheck, HeartPulse, Trophy, Users } from 'lucide-react'
import { KpiCard } from '@/components/common/KpiCard'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { DASHBOARD_SECTIONS, INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardSectionState } from '@/controllers/dashboard/useDashboardSection'
import type { DashboardOverview } from '@/types/dashboard'
import { formatLoad, formatNumber } from '@/utils/formatNumber'

export function OverviewSection({ state }: { state: DashboardSectionState<DashboardOverview> }) {
  return (
    <DashboardSection
      id="tablero-resumen"
      {...DASHBOARD_SECTIONS.overview}
      state={state}
      warnings={(data) => data.warnings}
    >
      {(data) => {
        const own = data.filters.own_data_only
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {!own && (
              <KpiCard
                label="Deportistas"
                value={data.athletes.in_scope}
                hint={`${data.athletes.with_load} reportaron RPE`}
                icon={Users}
              />
            )}
            <KpiCard
              label={own ? 'Sesiones de tus categorías' : 'Sesiones'}
              value={data.sessions.total}
              icon={CalendarCheck}
            />
            <KpiCard
              label={own ? 'Tus partidos' : 'Partidos'}
              value={data.matches.total}
              icon={Trophy}
            />
            <KpiCard
              label="Carga media por sesión"
              value={
                data.load.avg_session_load === null
                  ? INSUFFICIENT_DATA
                  : formatLoad(data.load.avg_session_load)
              }
              hint={
                data.load.avg_rpe === null
                  ? 'Sin RPE registrado'
                  : `RPE medio ${formatNumber(data.load.avg_rpe, 1)}`
              }
              icon={Activity}
              helpTerm="trainingLoad"
            />
            <KpiCard
              label="Alertas de fatiga sin revisar"
              value={data.fatigue_alerts.open}
              hint={`${data.fatigue_alerts.overload} por sobrecarga · ${data.fatigue_alerts.underload} por subcarga`}
              icon={BellRing}
            />
            <KpiCard
              label={own ? 'Tus lesiones activas' : 'Lesiones activas'}
              value={data.injuries.active}
              hint={`${data.injuries.in_period} lesiones en la temporada`}
              icon={HeartPulse}
            />
          </div>
        )
      }}
    </DashboardSection>
  )
}
