import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  ClipboardList,
  Cpu,
  HeartPulse,
  Sparkles,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { KpiCard } from '@/components/common/KpiCard'
import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { Button } from '@/components/ui/button'
import { STATUS_COLORS } from '@/constants/chartColors'
import { HUMAN_REVIEW_NOTE, INSUFFICIENT_DATA } from '@/constants/dashboard'
import { ROLE_LABELS } from '@/constants/roles'
import type { DashboardScopeState } from '@/controllers/dashboard/useDashboardScope'
import { useSummaryTab } from '@/controllers/dashboard/useDashboardTabs'
import type { DashboardSummary, DashboardSummaryModel } from '@/types/dashboard'
import { formatNumber } from '@/utils/formatNumber'

type Development = NonNullable<DashboardSummary['development']>
type Ml = NonNullable<DashboardSummary['ml']>

const count = (value: number) => formatNumber(value, 0)

const plural = (value: number, one: string, many: string) =>
  `${count(value)} ${value === 1 ? one : many}`

const TASK_LABELS: Record<DashboardSummaryModel['task'], string> = {
  talent: 'Talento',
  injury_risk: 'Riesgo de lesión',
}

const MODE_LABELS: Record<Ml['engine'], string> = {
  rules: 'deciden las reglas',
  shadow: 'modo sombra, deciden las reglas',
  ml: 'decide el modelo',
}

const ROLE_PLURALS: Record<string, string> = {
  ADMIN: 'administradores',
  DIRECTOR_TECNICO: 'directores técnicos',
  ENTRENADOR: 'entrenadores',
  ENCARGADO_SALUD: 'encargados de salud',
  DEPORTISTA: 'deportistas',
}

function roleCount(role: string, total: number) {
  const singular = role in ROLE_LABELS ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] : role
  const label =
    total === 1 ? singular.toLowerCase() : (ROLE_PLURALS[role] ?? singular.toLowerCase())
  return `${count(total)} ${label}`
}

function HighlightCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-4 rounded-2xl glass-subtle p-4 sm:p-5"
    >
      <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function LevelSplit({ label, alto, medio }: { label: string; alto: number; medio: number }) {
  const total = alto + medio
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-heading text-2xl font-semibold tabular-nums">{count(total)}</span>
      </div>
      {total > 0 && (
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
          <span style={{ flexGrow: alto, background: STATUS_COLORS.high }} />
          <span style={{ flexGrow: medio, background: STATUS_COLORS.medium }} />
        </div>
      )}
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ background: STATUS_COLORS.high }}
          />
          Alto {count(alto)}
        </span>
        <span className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ background: STATUS_COLORS.medium }}
          />
          Medio {count(medio)}
        </span>
      </p>
    </div>
  )
}

function AlertsCard({ data }: { data: DashboardSummary }) {
  return (
    <HighlightCard icon={BellRing} title="Alertas">
      <LevelSplit
        label="Alertas de fatiga"
        alto={data.fatigue_alerts.alto}
        medio={data.fatigue_alerts.medio}
      />
      <LevelSplit
        label="Evaluaciones de riesgo de lesión"
        alto={data.risk_assessments.alto}
        medio={data.risk_assessments.medio}
      />
      <p className="text-xs text-muted-foreground">
        Sin revisar: {count(data.fatigue_alerts.open)} alertas y {count(data.risk_assessments.open)}{' '}
        evaluaciones.
      </p>
    </HighlightCard>
  )
}

function ProgressCard({
  development,
  onOpenAthlete,
}: {
  development: Development
  onOpenAthlete: (idUser: number) => void
}) {
  const progress = development.progress
  const top = progress?.top ?? null
  const flags = development.talent_flags
  const profile = top ? [top.position, top.category].filter(Boolean).join(' de ') : ''
  return (
    <HighlightCard icon={Sparkles} title="Progreso y talento">
      {progress ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Índice más alto</span>
            <span className="font-heading text-3xl font-semibold text-primary tabular-nums">
              {top?.index_value === null || !top
                ? INSUFFICIENT_DATA
                : formatNumber(top.index_value, 1)}
            </span>
            <span className="text-xs text-muted-foreground">
              {profile ? `${profile} · ` : ''}
              {progress.season_name}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Promedio</span>
            <span className="font-heading text-3xl font-semibold tabular-nums">
              {progress.average.index_value === null
                ? INSUFFICIENT_DATA
                : formatNumber(progress.average.index_value, 1)}
            </span>
            <span className="text-xs text-muted-foreground">
              de {plural(progress.athletes, 'deportista', 'deportistas')}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {INSUFFICIENT_DATA}: aún no se ha calculado el índice de progreso.
        </p>
      )}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">Talentos señalados</span>
        <span className="font-heading text-2xl font-semibold tabular-nums">
          {count(flags.total)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {count(flags.open)} sin revisar. {HUMAN_REVIEW_NOTE}
      </p>
      {top && (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onOpenAthlete(top.id_user)}
        >
          Ver ficha del índice más alto
          <ArrowRight aria-hidden="true" />
        </Button>
      )}
    </HighlightCard>
  )
}

function ModelsCard({ ml }: { ml: Ml }) {
  const modeFor = (task: DashboardSummaryModel['task']) =>
    task === 'talent' ? ml.talent_engine : ml.engine
  return (
    <HighlightCard icon={Cpu} title="Modelos de ML">
      {ml.models.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay modelos activos: deciden las reglas.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ml.models.map((model) => (
            <li key={model.task} className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3">
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{TASK_LABELS[model.task]}</span>
                <span className="text-sm font-semibold">
                  {model.beats_rules === null
                    ? INSUFFICIENT_DATA
                    : model.beats_rules
                      ? 'Supera a las reglas'
                      : 'No supera a las reglas'}
                </span>
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                PR-AUC {model.pr_auc === null ? '—' : formatNumber(model.pr_auc, 3)} frente a{' '}
                {model.rules_pr_auc === null ? '—' : formatNumber(model.rules_pr_auc, 3)} de las
                reglas · {MODE_LABELS[modeFor(model.task)]}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        PR-AUC de 0 a 1: más alto es mejor. Siempre revisa una persona.
      </p>
    </HighlightCard>
  )
}

function RecordCards({ data }: { data: DashboardSummary }) {
  const records = data.records
  const users = data.users
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label="Deportistas"
        value={count(records.athletes)}
        hint={`en ${plural(records.categories, 'categoría', 'categorías')}`}
        icon={Users}
      />
      <KpiCard
        label="Sesiones de entrenamiento"
        value={count(records.sessions)}
        icon={CalendarCheck}
      />
      <KpiCard
        label="Registros de RPE"
        value={count(records.rpe_loads)}
        icon={ClipboardList}
        helpTerm="rpe"
      />
      <KpiCard label="Partidos" value={count(records.matches)} icon={Trophy} />
      <KpiCard
        label="Lesiones"
        value={count(records.injuries)}
        hint={`${count(records.non_contact_injuries)} sin contacto · ${plural(
          records.active_injuries,
          'activa',
          'activas',
        )}`}
        icon={HeartPulse}
        helpTerm="nonContactInjury"
      />
      {users && (
        <KpiCard
          label="Usuarios registrados"
          value={count(users.total)}
          hint={users.by_role
            .filter((item) => item.total > 0)
            .map((item) => roleCount(item.role, item.total))
            .join(' · ')}
          icon={UserCog}
        />
      )}
    </div>
  )
}

export function SummaryTab({ scope }: { scope: DashboardScopeState }) {
  const summary = useSummaryTab(scope)

  return (
    <DashboardSection
      id="tablero-resumen-club"
      title="Resumen del club"
      description="Todo lo registrado en la plataforma, en todas las temporadas."
      state={summary}
      warnings={(data) => data.warnings}
    >
      {(data) => (
        <div className="flex flex-col gap-6">
          <RecordCards data={data} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AlertsCard data={data} />
            {data.development && (
              <ProgressCard development={data.development} onOpenAthlete={scope.openAthlete} />
            )}
            {data.ml && <ModelsCard ml={data.ml} />}
          </div>
        </div>
      )}
    </DashboardSection>
  )
}
