import { describe, expect, it } from 'vitest'
import type { HealthAccessAction } from '@/constants/enums'
import type { HealthAuditLog } from '@/types/health'
import {
  auditActivity,
  auditPeople,
  auditRecordHistory,
  auditUserOptions,
  earliestAuditDay,
  filterAuditLogs,
  summarizeAudit,
} from '@/utils/healthAudit'

const DELETED = 'Cuenta eliminada'

let nextId = 1
function log(
  day: number,
  action: HealthAccessAction,
  user: number | null,
  record: number | null = null,
): HealthAuditLog {
  return {
    id_log: nextId++,
    id_health: record,
    accessed_by: user,
    accessed_by_name: user === null ? '' : `Persona ${user}`,
    action,
    accessed_at: new Date(2026, 10, day, 10, 30).toISOString(),
  }
}

const LOGS = [
  log(10, 'delete', 1, 7),
  log(10, 'list', 2),
  log(9, 'update', 1, 7),
  log(8, 'read', 2, 3),
  log(3, 'create', null, 9),
]

const NO_FILTERS = { from: '', to: '', userKey: '', action: '' as const }

describe('auditoría de salud', () => {
  it('filtra por periodo, usuario y acción sin perder accesos', () => {
    expect(filterAuditLogs(LOGS, NO_FILTERS)).toHaveLength(5)
    expect(
      filterAuditLogs(LOGS, { ...NO_FILTERS, from: '2026-11-08', to: '2026-11-09' }),
    ).toHaveLength(2)
    expect(filterAuditLogs(LOGS, { ...NO_FILTERS, userKey: '1' })).toHaveLength(2)
    expect(filterAuditLogs(LOGS, { ...NO_FILTERS, userKey: 'eliminada' })).toHaveLength(1)
    expect(filterAuditLogs(LOGS, { ...NO_FILTERS, action: 'delete' })).toHaveLength(1)
  })

  it('resume accesos, usuarios, registros y cambios', () => {
    expect(summarizeAudit(LOGS)).toEqual({
      accesses: 5,
      users: 3,
      records: 3,
      changes: 3,
      deletions: 1,
    })
    expect(summarizeAudit([])).toEqual({
      accesses: 0,
      users: 0,
      records: 0,
      changes: 0,
      deletions: 0,
    })
  })

  it('arma la actividad diaria con los días sin accesos en cero', () => {
    const series = auditActivity(LOGS, '2026-11-08', '2026-11-10')
    expect(series.map((point) => point.key)).toEqual(['2026-11-08', '2026-11-09', '2026-11-10'])
    expect(series.map((point) => [point.consultas, point.cambios])).toEqual([
      [1, 0],
      [0, 1],
      [1, 1],
    ])
    expect(auditActivity(LOGS, '2026-11-10', '2026-11-08')).toEqual([])
  })

  it('agrupa por semana cuando el periodo es largo', () => {
    const series = auditActivity(LOGS, '2026-09-01', '2026-11-10')
    expect(series[0].label).toMatch(/^Semana del /)
    const total = series.reduce((sum, point) => sum + point.consultas + point.cambios, 0)
    expect(total).toBe(5)
  })

  it('resume a cada persona con sus accesos, cambios y su último acceso', () => {
    const people = auditPeople(LOGS, DELETED)
    expect(people.map((person) => [person.name, person.total, person.changes])).toEqual([
      ['Persona 1', 2, 2],
      ['Persona 2', 2, 0],
      [DELETED, 1, 1],
    ])
    expect(people[0].lastAccess).toBe(LOGS[0].accessed_at)
    expect(people[0].byAction).toEqual({ create: 0, update: 1, delete: 1, read: 0, list: 0 })
    expect(people[1].byAction).toEqual({ create: 0, update: 0, delete: 0, read: 1, list: 1 })
    expect(auditUserOptions(LOGS, DELETED).map((option) => option.label)).toEqual([
      DELETED,
      'Persona 1',
      'Persona 2',
    ])
  })

  it('cuenta la historia de un registro de principio a fin', () => {
    const history = auditRecordHistory([
      log(10, 'delete', 1, 7),
      log(9, 'update', 2, 7),
      log(8, 'read', 2, 7),
      log(8, 'update', 1, 7),
      log(5, 'create', 1, 7),
    ])
    expect(history.created?.accessed_by).toBe(1)
    expect(history.edits).toBe(2)
    expect(history.lastEdit?.accessed_by).toBe(2)
    expect(history.opens).toBe(1)
    expect(history.people).toBe(2)
    expect(history.deleted?.accessed_by).toBe(1)
    expect(auditRecordHistory([]).firstAccess).toBeNull()
  })

  it('encuentra el primer día con accesos', () => {
    expect(earliestAuditDay(LOGS)).toBe('2026-11-03')
    expect(earliestAuditDay([])).toBeNull()
  })
})
