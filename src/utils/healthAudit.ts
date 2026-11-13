import { addDays, addWeeks, differenceInCalendarDays, format, startOfWeek } from 'date-fns'
import type { HealthAccessAction } from '@/constants/enums'
import type { HealthAuditLog } from '@/types/health'
import { parseApiDate } from '@/utils/formatDate'

export const AUDIT_CHANGE_ACTIONS: HealthAccessAction[] = ['create', 'update', 'delete']

export const DAILY_MAX_DAYS = 62

export interface AuditFilters {
  from: string
  to: string
  userKey: string
  action: HealthAccessAction | ''
}

export interface AuditSummary {
  accesses: number
  users: number
  records: number
  changes: number
  deletions: number
}

export interface AuditActivityPoint {
  key: string
  label: string
  consultas: number
  cambios: number
}

export interface AuditPerson {
  userKey: string
  name: string
  total: number
  changes: number
  lastAccess: string
  byAction: Record<HealthAccessAction, number>
}

export interface AuditRecordHistory {
  created: HealthAuditLog | null
  edits: number
  lastEdit: HealthAuditLog | null
  opens: number
  people: number
  deleted: HealthAuditLog | null
  firstAccess: HealthAuditLog | null
  lastAccess: HealthAuditLog | null
}

export const AUDIT_ACTION_VERBS: Record<HealthAccessAction, string> = {
  create: 'Registró',
  update: 'Editó',
  delete: 'Eliminó',
  read: 'Abrió',
  list: 'Consultó la lista',
}

export const AUDIT_ACTION_ORDER: HealthAccessAction[] = [
  'create',
  'update',
  'delete',
  'read',
  'list',
]

export function auditDayKey(log: HealthAuditLog): string {
  return format(new Date(log.accessed_at), 'yyyy-MM-dd')
}

export function auditUserKey(log: HealthAuditLog): string {
  return log.accessed_by === null ? 'eliminada' : String(log.accessed_by)
}

export function auditUserName(log: HealthAuditLog, deletedLabel: string): string {
  if (log.accessed_by_name) return log.accessed_by_name
  return log.accessed_by === null ? deletedLabel : `Usuario ${log.accessed_by}`
}

export function isChange(action: HealthAccessAction): boolean {
  return AUDIT_CHANGE_ACTIONS.includes(action)
}

export function filterAuditLogs(logs: HealthAuditLog[], filters: AuditFilters): HealthAuditLog[] {
  return logs.filter((log) => {
    const day = auditDayKey(log)
    if (filters.from && day < filters.from) return false
    if (filters.to && day > filters.to) return false
    if (filters.userKey && auditUserKey(log) !== filters.userKey) return false
    if (filters.action && log.action !== filters.action) return false
    return true
  })
}

export function summarizeAudit(logs: HealthAuditLog[]): AuditSummary {
  const users = new Set(logs.map(auditUserKey))
  const records = new Set(
    logs.map((log) => log.id_health).filter((id): id is number => typeof id === 'number'),
  )
  return {
    accesses: logs.length,
    users: users.size,
    records: records.size,
    changes: logs.filter((log) => isChange(log.action)).length,
    deletions: logs.filter((log) => log.action === 'delete').length,
  }
}

export function auditActivity(
  logs: HealthAuditLog[],
  from: string,
  to: string,
): AuditActivityPoint[] {
  const start = parseApiDate(from)
  const end = parseApiDate(to)
  if (!start || !end || start > end) return []
  const weekly = differenceInCalendarDays(end, start) + 1 > DAILY_MAX_DAYS
  const bucketOf = (day: Date) =>
    weekly ? format(startOfWeek(day, { weekStartsOn: 1 }), 'yyyy-MM-dd') : format(day, 'yyyy-MM-dd')

  const points = new Map<string, AuditActivityPoint>()
  let cursor = weekly ? startOfWeek(start, { weekStartsOn: 1 }) : start
  while (cursor <= end) {
    const key = format(cursor, 'yyyy-MM-dd')
    points.set(key, {
      key,
      label: weekly ? `Semana del ${format(cursor, 'dd/MM')}` : format(cursor, 'dd/MM'),
      consultas: 0,
      cambios: 0,
    })
    cursor = weekly ? addWeeks(cursor, 1) : addDays(cursor, 1)
  }
  for (const log of logs) {
    const point = points.get(bucketOf(new Date(log.accessed_at)))
    if (!point) continue
    if (isChange(log.action)) point.cambios += 1
    else point.consultas += 1
  }
  return [...points.values()]
}

export function auditPeople(logs: HealthAuditLog[], deletedLabel: string): AuditPerson[] {
  const people = new Map<string, AuditPerson>()
  for (const log of logs) {
    const userKey = auditUserKey(log)
    const person = people.get(userKey) ?? {
      userKey,
      name: auditUserName(log, deletedLabel),
      total: 0,
      changes: 0,
      lastAccess: log.accessed_at,
      byAction: { create: 0, update: 0, delete: 0, read: 0, list: 0 },
    }
    person.total += 1
    person.byAction[log.action] += 1
    if (isChange(log.action)) person.changes += 1
    if (log.accessed_at > person.lastAccess) person.lastAccess = log.accessed_at
    people.set(userKey, person)
  }
  return [...people.values()].sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name, 'es'),
  )
}

export function auditRecordHistory(logs: HealthAuditLog[]): AuditRecordHistory {
  const ordered = [...logs].sort((a, b) => a.accessed_at.localeCompare(b.accessed_at))
  const edits = ordered.filter((log) => log.action === 'update')
  const opens = ordered.filter((log) => log.action === 'read')
  return {
    created: ordered.find((log) => log.action === 'create') ?? null,
    edits: edits.length,
    lastEdit: edits[edits.length - 1] ?? null,
    opens: opens.length,
    people: new Set(ordered.map(auditUserKey)).size,
    deleted: ordered.find((log) => log.action === 'delete') ?? null,
    firstAccess: ordered[0] ?? null,
    lastAccess: ordered[ordered.length - 1] ?? null,
  }
}

export function auditUserOptions(logs: HealthAuditLog[], deletedLabel: string) {
  const seen = new Map<string, string>()
  for (const log of logs) seen.set(auditUserKey(log), auditUserName(log, deletedLabel))
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

export function earliestAuditDay(logs: HealthAuditLog[]): string | null {
  return logs.reduce<string | null>((min, log) => {
    const day = auditDayKey(log)
    return min === null || day < min ? day : min
  }, null)
}
