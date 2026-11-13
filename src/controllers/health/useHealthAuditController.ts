import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { useMemo, useState } from 'react'
import type { HealthAccessAction } from '@/constants/enums'
import { DELETED_ACCOUNT_LABEL, ROLE_LABELS, type RoleCode } from '@/constants/roles'
import { useDebounce } from '@/hooks/useDebounce'
import { MAX_PAGE_SIZE } from '@/lib/listRequest'
import { queryKeys } from '@/lib/queryKeys'
import { healthService } from '@/services/healthService'
import { usersService } from '@/services/usersService'
import type { HealthAuditLog } from '@/types/health'
import type { Pagination } from '@/types/api'
import { toApiDate, todayApiDate } from '@/utils/formatDate'
import {
  auditActivity,
  auditPeople,
  auditRecordHistory,
  auditUserOptions,
  earliestAuditDay,
  filterAuditLogs,
  summarizeAudit,
} from '@/utils/healthAudit'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 20
const PEOPLE_PAGE_SIZE = 10

function paginate<T>(items: T[], page: number, size: number) {
  const totalPages = Math.ceil(items.length / size)
  const current = Math.min(page, Math.max(totalPages, 1))
  const pagination: Pagination = { total: items.length, page: current, limit: size, totalPages }
  return { rows: items.slice((current - 1) * size, current * size), pagination }
}
const MAX_PAGES = 10
export const AUDIT_WINDOW = MAX_PAGE_SIZE * MAX_PAGES

export type AuditPeriod = 'hoy' | '7' | '30' | 'todo'

export const AUDIT_PERIODS: { value: AuditPeriod; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7', label: '7 días' },
  { value: '30', label: '30 días' },
  { value: 'todo', label: 'Todo' },
]

async function fetchRecentLogs(idHealth: number | undefined) {
  const first = await healthService.listAuditLogs({
    page: 1,
    limit: MAX_PAGE_SIZE,
    id_health: idHealth,
  })
  const pages = Math.min(first.pagination.totalPages, MAX_PAGES)
  const rest = await Promise.all(
    Array.from({ length: Math.max(pages - 1, 0) }, (_, index) =>
      healthService.listAuditLogs({ page: index + 2, limit: MAX_PAGE_SIZE, id_health: idHealth }),
    ),
  )
  return {
    logs: [first, ...rest].flatMap((result) => result.items),
    total: first.pagination.total,
  }
}

const HEALTH_RECORD_ROLES: RoleCode[] = ['ADMIN', 'ENCARGADO_SALUD']

export interface AuditRecordDetail {
  condition: string
  athlete: string
}

async function fetchRecordDetails(): Promise<Map<number, AuditRecordDetail>> {
  const first = await healthService.listHealthRecordsPage({ page: 1, limit: MAX_PAGE_SIZE })
  const rest = await Promise.all(
    Array.from({ length: Math.max(first.pagination.totalPages - 1, 0) }, (_, index) =>
      healthService.listHealthRecordsPage({ page: index + 2, limit: MAX_PAGE_SIZE }),
    ),
  )
  return new Map(
    [first, ...rest]
      .flatMap((result) => result.items)
      .map((record) => [
        record.id_health,
        { condition: record.condition_type, athlete: record.athlete_name ?? '' },
      ]),
  )
}

function periodStart(period: AuditPeriod, earliest: string | null): string {
  const today = new Date()
  if (period === 'hoy') return todayApiDate()
  if (period === '7') return toApiDate(subDays(today, 6))
  if (period === '30') return toApiDate(subDays(today, 29))
  return earliest ?? todayApiDate()
}

export function useHealthAuditController() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [peoplePage, setPeoplePage] = useState(1)
  const [showDetails, setShowDetails] = useState(false)
  const [recordId, setRecordIdState] = useState('')
  const [period, setPeriodState] = useState<AuditPeriod | null>('30')
  const [customFrom, setCustomFrom] = useState(() => periodStart('30', null))
  const [customTo, setCustomTo] = useState(todayApiDate)
  const [userKey, setUserKeyState] = useState('')
  const [action, setActionState] = useState<HealthAccessAction | ''>('')
  const debouncedRecordId = useDebounce(recordId, 400)
  const parsedRecordId = /^\d+$/.test(debouncedRecordId) ? Number(debouncedRecordId) : undefined

  const query = useQuery({
    queryKey: queryKeys.health.audit({ window: AUDIT_WINDOW, id_health: parsedRecordId }),
    queryFn: () => fetchRecentLogs(parsedRecordId),
    placeholderData: keepPreviousData,
  })

  const usersQuery = useQuery({ queryKey: queryKeys.users.list(), queryFn: usersService.listAll })
  const detailsQuery = useQuery({
    queryKey: [...queryKeys.health.all, 'audit-details'] as const,
    queryFn: async () => {
      const details = await fetchRecordDetails()
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.health.all, 'audit'] })
      return details
    },
    enabled: showDetails,
    staleTime: Infinity,
  })

  const roles = useMemo(
    () => new Map((usersQuery.data ?? []).map((user) => [String(user.id_user), user.role_name])),
    [usersQuery.data],
  )

  const logs = useMemo<HealthAuditLog[]>(() => query.data?.logs ?? [], [query.data])
  const earliest = useMemo(() => earliestAuditDay(logs), [logs])
  const from = period ? periodStart(period, earliest) : customFrom
  const to = period ? todayApiDate() : customTo
  const rangeError =
    !from || !to
      ? 'Elige las dos fechas.'
      : from > to
        ? 'La fecha inicial debe ser anterior a la final.'
        : undefined

  const filtered = useMemo(
    () => (rangeError ? [] : filterAuditLogs(logs, { from, to, userKey, action })),
    [logs, from, to, userKey, action, rangeError],
  )
  const summary = useMemo(() => summarizeAudit(filtered), [filtered])
  const activity = useMemo(
    () => (rangeError ? [] : auditActivity(filtered, from, to)),
    [filtered, from, to, rangeError],
  )
  const people = useMemo(
    () =>
      auditPeople(filtered, DELETED_ACCOUNT_LABEL).map((person) => {
        const role = roles.get(person.userKey) as RoleCode | undefined
        return {
          ...person,
          roleLabel: role ? (ROLE_LABELS[role] ?? role) : null,
          unexpectedRole: role !== undefined && !HEALTH_RECORD_ROLES.includes(role),
        }
      }),
    [filtered, roles],
  )
  const userOptions = useMemo(() => auditUserOptions(logs, DELETED_ACCOUNT_LABEL), [logs])

  const actions = paginate(filtered, page, PAGE_SIZE)
  const peopleTable = paginate(people, peoplePage, PEOPLE_PAGE_SIZE)

  const resetPage = () => {
    setPage(1)
    setPeoplePage(1)
  }
  const total = query.data?.total ?? 0
  const hasFilters =
    parsedRecordId !== undefined || userKey !== '' || action !== '' || period !== '30'

  const roleOf = (userKey: string) => {
    const role = roles.get(userKey) as RoleCode | undefined
    return role ? (ROLE_LABELS[role] ?? role) : null
  }

  return {
    rows: actions.rows,
    pagination: actions.pagination,
    roleOf,
    people: peopleTable.rows,
    peoplePagination: peopleTable.pagination,
    setPeoplePage,
    hasPeople: people.length > 0,
    history:
      parsedRecordId !== undefined
        ? auditRecordHistory(logs.filter((log) => log.id_health === parsedRecordId))
        : null,
    showDetails,
    loadDetails: () => setShowDetails(true),
    detailsLoading: detailsQuery.isFetching,
    detailsError: detailsQuery.isError ? parseApiError(detailsQuery.error) : undefined,
    recordDetail: (idHealth: number | null | undefined) =>
      idHealth ? (detailsQuery.data?.get(idHealth) ?? null) : null,
    detailsLoaded: detailsQuery.data !== undefined,
    setPage,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    summary,
    activity,
    userOptions,
    total,
    loaded: logs.length,
    truncated: total > logs.length,
    recordId,
    recordIdInvalid: recordId !== '' && !/^\d+$/.test(recordId),
    recordFilter: parsedRecordId,
    setRecordId: (value: string) => {
      setRecordIdState(value.trim())
      resetPage()
    },
    period,
    setPeriod: (value: AuditPeriod) => {
      setPeriodState(value)
      resetPage()
    },
    from,
    to,
    rangeError,
    setFrom: (value: string) => {
      setCustomFrom(value)
      setCustomTo(to)
      setPeriodState(null)
      resetPage()
    },
    setTo: (value: string) => {
      setCustomFrom(from)
      setCustomTo(value)
      setPeriodState(null)
      resetPage()
    },
    userKey,
    setUserKey: (value: string) => {
      setUserKeyState(value)
      resetPage()
    },
    action,
    setAction: (value: HealthAccessAction | '') => {
      setActionState(value)
      resetPage()
    },
    hasFilters,
    clearFilters: () => {
      setRecordIdState('')
      setUserKeyState('')
      setActionState('')
      setPeriodState('30')
      resetPage()
    },
  }
}

export type HealthAuditController = ReturnType<typeof useHealthAuditController>
