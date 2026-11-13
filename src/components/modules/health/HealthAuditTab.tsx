import {
  Eye,
  FilePen,
  FilePlus,
  History,
  Info,
  List,
  ScrollText,
  ShieldAlert,
  Trash2,
  UserSearch,
  X,
  type LucideIcon,
} from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { DateRangeFields } from '@/components/common/DateRangeFields'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { FormField } from '@/components/common/FormField'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SelectInput } from '@/components/common/SelectInput'
import { InteractiveBarChart } from '@/components/charts/interactive/InteractiveBarChart'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SERIES_COLORS } from '@/constants/chartColors'
import type { HealthAccessAction } from '@/constants/enums'
import { DELETED_ACCOUNT_LABEL } from '@/constants/roles'
import {
  AUDIT_PERIODS,
  useHealthAuditController,
  type HealthAuditController,
} from '@/controllers/health/useHealthAuditController'
import { cn } from '@/lib/utils'
import type { HealthAuditLog } from '@/types/health'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'
import {
  AUDIT_ACTION_ORDER,
  AUDIT_ACTION_VERBS,
  auditUserKey,
  auditUserName,
} from '@/utils/healthAudit'

const ALL = 'todos'
const count = (value: number) => formatNumber(value, 0)
const plural = (value: number, one: string, many: string) =>
  `${count(value)} ${value === 1 ? one : many}`

const ACTIVITY_SERIES = [
  { key: 'consultas', label: 'Consultas', color: SERIES_COLORS[0] },
  { key: 'cambios', label: 'Cambios', color: SERIES_COLORS[1] },
]

const ACTION_ICONS: Record<HealthAccessAction, { icon: LucideIcon; className: string }> = {
  list: { icon: List, className: 'text-muted-foreground' },
  read: { icon: Eye, className: 'text-primary' },
  create: { icon: FilePlus, className: 'text-risk-low' },
  update: { icon: FilePen, className: 'text-risk-medium' },
  delete: { icon: Trash2, className: 'text-risk-high' },
}

function periodText(from: string, to: string) {
  return from === to
    ? `El ${formatDate(from)}`
    : `Entre el ${formatDate(from)} y el ${formatDate(to)}`
}

function AuditFilters({ controller }: { controller: HealthAuditController }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div
          role="group"
          aria-label="Periodo de la auditoría"
          className="flex flex-wrap gap-1 rounded-xl glass-subtle p-1"
        >
          {AUDIT_PERIODS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={controller.period === option.value ? 'default' : 'ghost'}
              aria-pressed={controller.period === option.value}
              onClick={() => controller.setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <DateRangeFields
          idPrefix="auditoria"
          from={controller.from}
          to={controller.to}
          onFromChange={controller.setFrom}
          onToChange={controller.setTo}
          error={controller.rangeError}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <FormField id="auditoria-usuario" label="Persona">
          {(controlProps) => (
            <SelectInput
              {...controlProps}
              value={controller.userKey || ALL}
              onValueChange={(value) => controller.setUserKey(value === ALL ? '' : value)}
              options={[{ value: ALL, label: 'Todas las personas' }, ...controller.userOptions]}
            />
          )}
        </FormField>
        <FormField id="auditoria-accion" label="Qué hizo">
          {(controlProps) => (
            <SelectInput
              {...controlProps}
              value={controller.action || ALL}
              onValueChange={(value) =>
                controller.setAction(value === ALL ? '' : (value as HealthAccessAction))
              }
              options={[
                { value: ALL, label: 'Cualquier acción' },
                ...AUDIT_ACTION_ORDER.map((value) => ({
                  value,
                  label: AUDIT_ACTION_VERBS[value],
                })),
              ]}
            />
          )}
        </FormField>
        <FormField
          id="audit-record"
          label="Número de registro"
          optional
          error={controller.recordIdInvalid ? 'Escribe solo números.' : undefined}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              inputMode="numeric"
              value={controller.recordId}
              onChange={(event) => controller.setRecordId(event.target.value)}
              placeholder="Todos"
            />
          )}
        </FormField>
        {controller.hasFilters && (
          <Button variant="outline" className="w-fit" onClick={controller.clearFilters}>
            <X aria-hidden="true" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}

function SummaryLine({ controller }: { controller: HealthAuditController }) {
  const { accesses, users, changes, deletions } = controller.summary
  const reads = accesses - changes
  const when = periodText(controller.from, controller.to)
  const text =
    accesses === 0
      ? `${when} no hubo accesos a los datos de salud con los filtros elegidos.`
      : `${when}, ${plural(users, 'persona', 'personas')} ${users === 1 ? 'accedió' : 'accedieron'} ${plural(accesses, 'vez', 'veces')} a los datos de salud: ${plural(reads, 'consulta', 'consultas')} y ${plural(changes, 'cambio', 'cambios')}${deletions > 0 ? `, de ellos ${plural(deletions, 'eliminación', 'eliminaciones')}` : ''}.`
  return (
    <p
      className="flex items-start gap-3 rounded-2xl glass-subtle p-4 text-base sm:p-5"
      aria-live="polite"
    >
      <ScrollText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <span>{text}</span>
    </p>
  )
}

function RecordHistory({ controller }: { controller: HealthAuditController }) {
  const history = controller.history
  const id = controller.recordFilter
  if (!history || id === undefined) return null
  const detail = controller.recordDetail(id)
  const nameOf = (log: HealthAuditLog) => auditUserName(log, DELETED_ACCOUNT_LABEL)
  const steps: string[] = []
  if (!history.firstAccess) steps.push('No hay accesos a este registro en la auditoría.')
  else {
    steps.push(
      history.created
        ? `Lo registró ${nameOf(history.created)} el ${formatDateTime(history.created.accessed_at)}.`
        : 'No aparece quién lo registró: pudo registrarse antes de que existiera la auditoría o quedar fuera de los accesos analizados.',
    )
    steps.push(
      history.lastEdit
        ? `Se editó ${plural(history.edits, 'vez', 'veces')}; la última la hizo ${nameOf(history.lastEdit)} el ${formatDateTime(history.lastEdit.accessed_at)}.`
        : 'No se ha editado.',
    )
    steps.push(
      `Se abrió ${plural(history.opens, 'vez', 'veces')} y ${plural(history.people, 'persona accedió', 'personas accedieron')} a él.`,
    )
    if (history.deleted)
      steps.push(
        `Lo eliminó ${nameOf(history.deleted)} el ${formatDateTime(history.deleted.accessed_at)}.`,
      )
  }
  return (
    <section
      aria-labelledby="auditoria-historia"
      className="flex flex-col gap-3 rounded-2xl border border-primary/40 p-4 sm:p-5"
    >
      <h3 id="auditoria-historia" className="flex flex-wrap items-center gap-2 font-semibold">
        <History aria-hidden="true" className="size-5 text-primary" />
        Historia del registro #{id}
        {detail && (
          <span className="font-normal text-muted-foreground">
            · {detail.condition}
            {detail.athlete && ` de ${detail.athlete}`}
          </span>
        )}
      </h3>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        La historia cubre todos los accesos analizados a este registro, sin importar el periodo
        elegido.
      </p>
    </section>
  )
}

function PersonCell({
  name,
  role,
  unexpectedRole,
  onSelect,
  selected,
}: {
  name: string
  role: string | null
  unexpectedRole?: boolean
  onSelect: () => void
  selected?: boolean
}) {
  return (
    <span className="flex flex-col gap-0.5">
      <Button
        variant="link"
        className={cn(
          'h-auto justify-start p-0 font-medium text-foreground',
          selected && 'text-primary underline',
        )}
        aria-pressed={selected}
        aria-label={`Ver solo lo que hizo ${name}`}
        onClick={onSelect}
      >
        {name}
      </Button>
      {role && <span className="text-xs text-muted-foreground">{role}</span>}
      {unexpectedRole && (
        <span className="flex items-center gap-1 text-xs text-risk-high">
          <ShieldAlert aria-hidden="true" className="size-3.5 shrink-0" />
          Hoy su rol no puede ver registros de salud
        </span>
      )}
    </span>
  )
}

function ActionLabel({ action }: { action: HealthAccessAction }) {
  const { icon: Icon, className } = ACTION_ICONS[action]
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <Icon aria-hidden="true" className={cn('size-4 shrink-0', className)} />
      {AUDIT_ACTION_VERBS[action]}
    </span>
  )
}

function PeopleTable({ controller }: { controller: HealthAuditController }) {
  const amount = (value: number) =>
    value === 0 ? <span className="text-muted-foreground">0</span> : count(value)
  return (
    <section aria-labelledby="auditoria-personas" className="flex flex-col gap-3">
      <header>
        <h3
          id="auditoria-personas"
          className="flex items-center gap-2 font-heading text-lg font-semibold"
        >
          <UserSearch aria-hidden="true" className="size-5 text-primary" />
          Qué hizo cada persona
        </h3>
        <p className="text-sm text-muted-foreground">
          Cuántas veces registró, editó, eliminó, abrió o consultó registros de salud en el periodo.
          Toca un nombre para ver el detalle de sus acciones. El rol es el que tiene hoy.
        </p>
      </header>
      <DataTable
        caption="Qué hizo cada persona"
        rows={controller.people}
        getRowKey={(person) => person.userKey}
        pagination={controller.peoplePagination}
        onPageChange={controller.setPeoplePage}
        emptyState={<EmptyState icon={UserSearch} title="Nadie accedió en el periodo" />}
        columns={[
          {
            key: 'person',
            header: 'Persona',
            cell: (person) => (
              <PersonCell
                name={person.name}
                role={person.roleLabel}
                unexpectedRole={person.unexpectedRole}
                selected={controller.userKey === person.userKey}
                onSelect={() =>
                  controller.setUserKey(controller.userKey === person.userKey ? '' : person.userKey)
                }
              />
            ),
          },
          ...AUDIT_ACTION_ORDER.map((action) => ({
            key: action,
            header: AUDIT_ACTION_VERBS[action],
            className: 'tabular-nums',
            cell: (person: (typeof controller.people)[number]) => amount(person.byAction[action]),
          })),
          {
            key: 'total',
            header: 'Total',
            className: 'tabular-nums font-semibold',
            cell: (person) => count(person.total),
          },
          {
            key: 'last',
            header: 'Último acceso',
            className: 'tabular-nums whitespace-nowrap',
            cell: (person) => formatDateTime(person.lastAccess),
          },
        ]}
      />
    </section>
  )
}

function ActionsTable({ controller }: { controller: HealthAuditController }) {
  return (
    <DataTable
      caption="Detalle de acciones"
      rows={controller.rows}
      getRowKey={(log) => log.id_log}
      pagination={controller.pagination}
      onPageChange={controller.setPage}
      emptyState={
        <EmptyState
          icon={ScrollText}
          title={
            controller.total === 0 && controller.recordFilter === undefined
              ? 'Aún no hay accesos registrados'
              : 'No hay accesos con esos filtros'
          }
          description={
            controller.hasFilters ? 'Cambia el periodo o limpia los filtros.' : undefined
          }
        />
      }
      columns={[
        {
          key: 'date',
          header: 'Fecha y hora',
          className: 'tabular-nums whitespace-nowrap',
          cell: (log) => formatDateTime(log.accessed_at),
        },
        {
          key: 'person',
          header: 'Persona',
          cell: (log) => (
            <PersonCell
              name={auditUserName(log, DELETED_ACCOUNT_LABEL)}
              role={log.accessed_by === null ? null : controller.roleOf(auditUserKey(log))}
              onSelect={() => controller.setUserKey(auditUserKey(log))}
            />
          ),
        },
        {
          key: 'action',
          header: 'Qué hizo',
          cell: (log) => <ActionLabel action={log.action} />,
        },
        {
          key: 'record',
          header: 'Registro de salud',
          cell: (log) => {
            if (!log.id_health)
              return <span className="text-muted-foreground">La lista completa</span>
            const detail = controller.recordDetail(log.id_health)
            return (
              <span className="flex flex-wrap items-baseline gap-x-1.5">
                <Button
                  variant="link"
                  className="h-auto p-0 tabular-nums"
                  aria-label={`Ver la historia del registro ${log.id_health}`}
                  onClick={() => controller.setRecordId(String(log.id_health))}
                >
                  #{log.id_health}
                </Button>
                {detail ? (
                  <span className="text-muted-foreground">
                    {detail.condition}
                    {detail.athlete && ` de ${detail.athlete}`}
                  </span>
                ) : (
                  controller.detailsLoaded && (
                    <span className="text-muted-foreground">ya no existe</span>
                  )
                )}
              </span>
            )
          },
        },
      ]}
    />
  )
}

function DetailsNotice({ controller }: { controller: HealthAuditController }) {
  if (controller.detailsLoaded)
    return (
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        Se muestra la condición y el deportista de cada registro. Tu consulta quedó anotada en la
        auditoría.
      </p>
    )
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Los registros aparecen por su número. Para ver a qué deportista y condición corresponde cada
        uno hay que consultar los registros de salud, y esa consulta también queda anotada en la
        auditoría.
      </p>
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={controller.loadDetails}
          disabled={controller.detailsLoading}
        >
          <Eye aria-hidden="true" />
          {controller.detailsLoading ? 'Consultando…' : 'Ver deportista y condición'}
        </Button>
        {controller.detailsError && (
          <p role="alert" className="text-sm text-destructive">
            {controller.detailsError}
          </p>
        )}
      </div>
    </div>
  )
}

export function HealthAuditTab() {
  const controller = useHealthAuditController()

  return (
    <div className="flex flex-col gap-6">
      <TabToolbar description="Quién entró a los datos de salud, qué hizo y cuándo. Toca una persona o un número de registro para seguir su rastro. Revisar esta auditoría no queda anotado en ella. Solo la ve el administrador." />

      <AuditFilters controller={controller} />

      {controller.truncated && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          Se analizan los {count(controller.loaded)} accesos más recientes de{' '}
          {count(controller.total)}. Para revisar accesos anteriores a un registro, busca su número.
        </p>
      )}

      {controller.isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} label="Cargando la auditoría" />
      ) : controller.errorMessage ? (
        <ErrorState
          message={controller.errorMessage}
          onRetry={controller.retry}
          isRetrying={controller.isFetching}
        />
      ) : (
        <>
          <SummaryLine controller={controller} />
          <RecordHistory controller={controller} />
          <PeopleTable controller={controller} />
          <InteractiveBarChart
            title="Actividad en el periodo"
            description="Accesos por día (o por semana en periodos largos). Consultas: ver la lista o abrir un registro. Cambios: registrar, editar o eliminar."
            data={controller.activity}
            categoryKey="label"
            stacked
            integerValues
            series={ACTIVITY_SERIES}
            formatValue={(value) => count(value ?? 0)}
            emptyMessage="No hubo accesos en el periodo."
          />
          <section aria-labelledby="auditoria-linea" className="flex flex-col gap-4">
            <header>
              <h3 id="auditoria-linea" className="font-heading text-lg font-semibold">
                Detalle de acciones
              </h3>
              <p className="text-sm text-muted-foreground">
                Cada fila es una acción, de la más reciente a la más antigua.
              </p>
            </header>
            <DetailsNotice controller={controller} />
            <ActionsTable controller={controller} />
          </section>
        </>
      )}
    </div>
  )
}
