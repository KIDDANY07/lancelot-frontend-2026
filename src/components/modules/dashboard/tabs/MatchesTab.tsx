import { Clock, Goal, Handshake, Shield, Square, Trophy } from 'lucide-react'
import { KpiCard } from '@/components/common/KpiCard'
import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { SERIES_COLORS } from '@/constants/chartColors'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useMatchesTab } from '@/controllers/dashboard/useDashboardTabs'
import type { PlayerContribution } from '@/types/dashboard'
import { monthLabel } from '@/utils/dashboardFormat'
import { formatNumber } from '@/utils/formatNumber'

const whole = (value: number | null) => formatNumber(value, 0)

export function MatchesTab({ scope }: { scope: DashboardScopeState }) {
  const matches = useMatchesTab(scope)
  const athleteHint = scope.isAthlete ? undefined : 'Clic para abrir la ficha del deportista'
  const openAthlete = scope.isAthlete
    ? undefined
    : (row: PlayerContribution) => scope.openAthlete(row.id_user)

  return (
    <DashboardSection
      id="tablero-partidos"
      title={scope.isAthlete ? 'Tus partidos' : 'Partidos y competencias'}
      description="Partidos jugados en el periodo y las estadísticas registradas de cada deportista."
      state={matches}
      skeleton="cards"
      warnings={(data) => data.warnings}
    >
      {(data) => {
        const totals = data.totals
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              <KpiCard
                label="Partidos"
                value={totals.matches}
                hint={`${totals.appearances} participaciones de ${totals.players} deportistas`}
                icon={Trophy}
              />
              <KpiCard
                label="Minutos jugados"
                value={formatNumber(totals.minutes, 0)}
                hint={
                  totals.avg_minutes === null
                    ? INSUFFICIENT_DATA
                    : `${formatNumber(totals.avg_minutes, 0)} min por participación`
                }
                icon={Clock}
              />
              <KpiCard label="Goles" value={totals.goals} icon={Goal} />
              <KpiCard label="Asistencias" value={totals.assists} icon={Handshake} />
              <KpiCard
                label="Tarjetas"
                value={totals.yellow_cards + totals.red_cards}
                hint={`${totals.yellow_cards} amarillas · ${totals.red_cards} rojas`}
                icon={Square}
              />
              <KpiCard
                label="Atajadas"
                value={totals.saves}
                hint={`${totals.goals_conceded} goles recibidos · RPE medio ${
                  totals.avg_rpe === null ? 'sin datos' : formatNumber(totals.avg_rpe, 1)
                }`}
                icon={Shield}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InteractiveBarChart
                title="Partidos por mes"
                data={data.monthly}
                categoryKey="key"
                formatCategory={monthLabel}
                series={[{ key: 'matches', label: 'Partidos', color: SERIES_COLORS[0] }]}
                formatValue={whole}
                integerValues
              />
              <InteractiveBarChart
                title="Goles y asistencias por mes"
                description="Oculta una de las dos series con la leyenda para compararlas por separado."
                data={data.monthly}
                categoryKey="key"
                formatCategory={monthLabel}
                series={[
                  { key: 'goals', label: 'Goles', color: SERIES_COLORS[0] },
                  { key: 'assists', label: 'Asistencias', color: SERIES_COLORS[1] },
                ]}
                formatValue={whole}
                integerValues
              />
              <InteractiveBarChart
                title="Partidos por competencia"
                data={data.by_competition}
                categoryKey="name"
                horizontal
                series={[
                  { key: 'matches', label: 'Partidos', color: SERIES_COLORS[0] },
                  { key: 'goals', label: 'Goles', color: SERIES_COLORS[1] },
                ]}
                formatValue={whole}
                integerValues
              />
              {!scope.isAthlete && (
                <InteractiveBarChart<PlayerContribution>
                  title="Más goles y asistencias"
                  description="Los 10 deportistas con más goles más asistencias en el periodo."
                  data={data.top_contributions}
                  categoryKey="athlete"
                  horizontal
                  stacked
                  series={[
                    { key: 'goals', label: 'Goles', color: SERIES_COLORS[0] },
                    { key: 'assists', label: 'Asistencias', color: SERIES_COLORS[1] },
                  ]}
                  formatValue={whole}
                  integerValues
                  onSelect={openAthlete}
                  selectHint={athleteHint}
                />
              )}
              {!scope.isAthlete && (
                <div className="xl:col-span-2">
                  <InteractiveBarChart<PlayerContribution>
                    title="Más minutos jugados"
                    description="Los 10 deportistas con más minutos en el periodo."
                    data={data.top_minutes}
                    categoryKey="athlete"
                    horizontal
                    series={[{ key: 'minutes', label: 'Minutos', color: SERIES_COLORS[0] }]}
                    formatValue={(value) => `${whole(value)} min`}
                    onSelect={openAthlete}
                    selectHint={athleteHint}
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
