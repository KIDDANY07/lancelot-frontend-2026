import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '@/services/authService'
import { dashboardService } from '@/services/dashboardService'
import { usersService } from '@/services/usersService'
import { createApiError } from '@/test/apiErrors'
import { ACTIVE_SEASON, primeAppDataMocks } from '@/test/appDataMocks'
import { ADMIN_USER, ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
import type {
  DashboardByCategory,
  DashboardBySeason,
  DashboardDevelopment,
  DashboardHealth,
  DashboardMatches,
  DashboardMl,
  DashboardTraining,
  DashboardInjuryRisk,
  DashboardLoad,
  DashboardOverview,
  DashboardScope,
  DashboardSummary,
} from '@/types/dashboard'
import type { User } from '@/types/user'
import { REFRESH_TOKEN_STORAGE_KEY } from '@/utils/tokenStorage'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshSession: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
  },
}))
vi.mock('@/services/usersService', () => ({
  usersService: {
    getMe: vi.fn(),
    updateMe: vi.fn(),
    changeMyPassword: vi.fn(),
    listAll: vi.fn(),
    listUsers: vi.fn(),
    listAllAthletes: vi.fn(),
    searchAthletes: vi.fn(),
    createByAdmin: vi.fn(),
    updateByAdmin: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/seasonsService', () => ({
  seasonsService: { listAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/categoriesService', () => ({
  categoriesService: { listAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/athleteAssignmentsService', () => ({
  athleteAssignmentsService: {
    list: vi.fn(),
    listAll: vi.fn(),
    count: vi.fn(),
    getMine: vi.fn(),
    history: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/alertsService', () => ({ alertsService: { countOpen: vi.fn() } }))
vi.mock('@/services/weightProfilesService', () => ({
  weightProfilesService: { listAll: vi.fn(), count: vi.fn() },
}))
vi.mock('@/services/parentalConsentsService', () => ({
  parentalConsentsService: { listAll: vi.fn() },
}))
vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    overview: vi.fn(),
    load: vi.fn(),
    byCategory: vi.fn(),
    bySeason: vi.fn(),
    injuryRisk: vi.fn(),
    training: vi.fn(),
    matches: vi.fn(),
    health: vi.fn(),
    development: vi.fn(),
    ml: vi.fn(),
    summary: vi.fn(),
  },
}))

const HEALTH_USER: User = { ...COACH_USER, id_user: 11, id_role: 5, role_name: 'ENCARGADO_SALUD' }

const SCOPE: DashboardScope = {
  from: '2026-02-01',
  to: '2026-11-07',
  days: 280,
  id_season: ACTIVE_SEASON.id_season,
  id_category: null,
  athletes_in_scope: 15,
  own_data_only: false,
}

const OVERVIEW: DashboardOverview = {
  filters: SCOPE,
  athletes: { in_scope: 15, with_load: 14 },
  sessions: { total: 86 },
  matches: { total: 17 },
  load: { loads: 0, avg_session_load: null, avg_rpe: null },
  fatigue_alerts: { open: 30, underload: 18, overload: 12, athletes: 9 },
  injuries: { active: 1, recovering: 1, in_period: 4 },
  last_load_date: null,
  warnings: ['No hay cargas registradas para este alcance'],
}

const LOAD: DashboardLoad = {
  filters: SCOPE,
  granularity: 'week',
  zones: { low_min: 0.8, low_max: 1.3, medium_max: 1.5, scope: 'global' },
  series: [],
  warnings: [],
}

const BY_CATEGORY: DashboardByCategory = {
  filters: SCOPE,
  season: { id_season: ACTIVE_SEASON.id_season, name: ACTIVE_SEASON.name, status: 'active' },
  categories: [
    {
      id_category: 4,
      name: 'Sub-15',
      athletes: 12,
      sessions: 0,
      avg_session_load: null,
      avg_rpe: null,
      rpe_coverage_pct: null,
      open_alerts: 3,
      athletes_at_risk: 2,
      injuries: 1,
      avg_progress_index: 61.5,
      progress_athletes: 10,
      open_talent_flags: 2,
    },
  ],
  definitions: {
    rpe_coverage_pct: 'Cargas registradas entre esperadas',
    avg_progress_index: 'Solo deportistas cuya categoría base es esta',
    athletes: 'Nota',
  },
  warnings: [],
}

const BY_SEASON: DashboardBySeason = {
  id_category: null,
  seasons: [
    {
      id_season: ACTIVE_SEASON.id_season,
      name: ACTIVE_SEASON.name,
      status: 'active',
      start_date: '2026-02-01',
      end_date: null,
      athletes: 15,
      sessions: 86,
      matches: 17,
      avg_session_load: 407.1,
      avg_rpe: 5,
      injuries: 11,
      avg_progress_index: null,
      talent_flags: 12,
    },
  ],
  warnings: [],
}

const RISK: DashboardInjuryRisk = {
  filters: SCOPE,
  counts: { alto: 1, medio: 0 },
  athletes: [
    {
      id_user: 21,
      athlete: 'Deportista Uno',
      risk_level: 'alto',
      last_level: 'alto',
      last_date: '2026-10-29',
      open_days: 4,
      acwr: 1.72,
      origin: 'reglas',
      factors: ['ACWR alto sostenido'],
    },
  ],
  warnings: [],
}

const TRAINING: DashboardTraining = {
  filters: SCOPE,
  by_type: [
    {
      type: 'tecnico',
      label: 'Técnico',
      sessions: 7,
      planned_minutes: 80,
      actual_minutes: 78,
      loads: 80,
      avg_session_load: 372.6,
      avg_rpe: 4.8,
    },
    {
      type: 'fisico',
      label: 'Físico',
      sessions: 0,
      planned_minutes: null,
      actual_minutes: null,
      loads: 0,
      avg_session_load: null,
      avg_rpe: null,
    },
  ],
  by_weekday: [{ day: 1, label: 'Lunes', sessions: 28 }],
  rpe_distribution: [{ rpe: 5, total: 446 }],
  warnings: [],
}

const MATCHES: DashboardMatches = {
  filters: SCOPE,
  totals: {
    matches: 17,
    appearances: 181,
    players: 15,
    minutes: 3400,
    goals: 50,
    assists: 39,
    yellow_cards: 12,
    red_cards: 1,
    saves: 103,
    goals_conceded: 44,
    avg_minutes: 19,
    avg_rpe: null,
  },
  monthly: [{ key: '2026-05', matches: 5, goals: 15, assists: 10, avg_rpe: 6.9 }],
  by_competition: [{ id_competency: 10, name: 'Liga', matches: 17, goals: 50 }],
  top_contributions: [
    {
      id_user: 21,
      athlete: 'Deportista Uno',
      appearances: 12,
      minutes: 300,
      goals: 11,
      assists: 9,
    },
  ],
  top_minutes: [
    {
      id_user: 21,
      athlete: 'Deportista Uno',
      appearances: 12,
      minutes: 300,
      goals: 11,
      assists: 9,
    },
  ],
  warnings: ['15 participaciones en partidos no tienen RPE registrado'],
}

const HEALTH: DashboardHealth = {
  filters: SCOPE,
  injuries_monthly: [{ key: '2026-05', contact: 0, non_contact: 2, unknown: 0 }],
  injuries_by_body_part: [{ body_part: 'tobillo', total: 2, leve: 1, moderada: 1, severa: 0 }],
  injuries_by_severity: [
    { severity: 'leve', total: 1, avg_days_lost: 5, total_days_lost: 5 },
    { severity: 'moderada', total: 1, avg_days_lost: 10, total_days_lost: 10 },
    { severity: 'severa', total: 0, avg_days_lost: null, total_days_lost: 0 },
  ],
  injury_status: { active: 0, recovering: 1, recovered: 1 },
  fatigue_weekly: [{ key: '2026-05-04', overload: 3, underload: 2, open: 4 }],
  risk_weekly: [{ key: '2026-05-04', medio: 2, alto: 1 }],
  health_records: [
    {
      condition_type: 'Valoración médica de ingreso',
      status: 'resolved',
      total: 15,
      restricted: 0,
    },
  ],
  consents: { by_status: [{ status: 'granted', total: 8 }], minors: 3, minors_without_consent: 1 },
  underload_threshold: 0.8,
  warnings: [],
}

const DEVELOPMENT: DashboardDevelopment = {
  filters: SCOPE,
  id_season: ACTIVE_SEASON.id_season,
  technical_by_indicator: [
    {
      dimension: 'tecnica',
      indicator: 'Conducción',
      avg_score: 7.03,
      evaluations: 15,
      athletes: 15,
    },
  ],
  technical_monthly: [{ key: '2026-04', tecnica: 6.8, tactica: 6.7 }],
  physical_by_stage: [
    {
      stage: 'pre',
      label: 'Inicial',
      evaluations: 15,
      vo2max: 50.9,
      speed_20m: 3.17,
      weight_kg: 72,
      height_cm: 177.5,
    },
    {
      stage: 'post',
      label: 'Final',
      evaluations: 30,
      vo2max: 51.8,
      speed_20m: 3.13,
      weight_kg: 72.4,
      height_cm: 177.7,
    },
  ],
  progress: {
    athletes: 15,
    index_value: 62.4,
    previous_index: null,
    components: [{ key: 'physical', label: 'Físico', value: 54.2 }],
    distribution: [{ from: 55, to: 60, total: 7 }],
  },
  talent_flags: [{ source: 'rules', open: 4, reviewed: 0, dismissed: 0 }],
  objectives: { open: 15, achieved: 0, missed: 0, overdue: 15 },
  warnings: [],
}

const ML: DashboardMl = {
  filters: SCOPE,
  engine: {
    engine: 'shadow',
    talent_engine: 'ml',
    prob_medium_threshold: 0.015,
    prob_high_threshold: 0.021,
    talent_prob_threshold: 0.5,
  },
  models: [
    {
      id_model: 9,
      version: 'lr-1',
      task: 'injury_risk',
      algorithm: 'LogisticRegression',
      is_active: true,
      created: '2026-11-06',
      pr_auc: 0.045,
      roc_auc: 0.52,
      recall: 0.24,
      precision: 0.04,
      rules_pr_auc: 0.068,
    },
  ],
  predictions_daily: [],
  probability_distribution: [],
  labels: [{ label_quality: 'labeled', total: 2985, positives: 63 }],
  readiness: {
    injury: { ready: true, criteria: [{ code: 'deportistas', value: 15, minimum: 15, met: true }] },
    talent: { ready: false, criteria: [] },
  },
  talent_predictions: {
    id_season: 1,
    season_name: '2025-1',
    is_selected_season: false,
    total: 15,
    rules_flagged: 5,
    above_threshold: 10,
    distribution: [{ from: 0.5, to: 0.6, total: 6 }],
  },
  warnings: [
    'El modelo activo lr-1 no supera a las reglas en la prueba (PR-AUC 0.045 frente a 0.068)',
  ],
}

const SUMMARY: DashboardSummary = {
  filters: {
    id_season: null,
    id_category: null,
    season_name: null,
    category_name: null,
    from: null,
    to: null,
    all_history: true,
  },
  users: {
    total: 19,
    by_role: [
      { role: 'ADMIN', total: 1 },
      { role: 'DIRECTOR_TECNICO', total: 1 },
      { role: 'ENTRENADOR', total: 1 },
      { role: 'ENCARGADO_SALUD', total: 1 },
      { role: 'DEPORTISTA', total: 15 },
    ],
  },
  records: {
    athletes: 15,
    athletes_with_load: 15,
    categories: 4,
    seasons: 4,
    sessions: 246,
    rpe_loads: 2891,
    matches: 114,
    injuries: 31,
    non_contact_injuries: 23,
    contact_injuries: 8,
    active_injuries: 1,
  },
  load: {
    avg_rpe: null,
    avg_session_load: 391.7,
    acwr_thresholds: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
  },
  fatigue_alerts: { total: 2965, alto: 2264, medio: 701, bajo: 0, open: 2964 },
  risk_assessments: { total: 1069, alto: 216, medio: 853, open: 1069 },
  risk_rules: {
    acwr_threshold: 1.5,
    acwr_min_days: 2,
    acwr_lookback_days: 7,
    rpe_threshold: 8,
    rpe_min_sessions: 3,
    rpe_lookback_days: 14,
  },
  development: {
    progress: {
      id_season: 4,
      season_name: '2026-2',
      athletes: 15,
      average: {
        index_value: 62.4,
        physical: 54.2,
        technical: 69.3,
        tactical: 68.1,
        participation: 56.6,
      },
      top: {
        id_user: 21,
        index_value: 84.5,
        position: 'Ala',
        category: 'Sub-15',
        physical: 100,
        technical: 81.4,
        tactical: 81,
        participation: 75.5,
      },
    },
    talent_flags: { total: 52, open: 49, rules: 18, ml: 33, manual: 1 },
    talent_rules: {
      min_percentile: 80,
      min_dimension_score: 40,
      min_improvement_delta: 5,
      min_participation_score: 50,
    },
  },
  ml: {
    engine: 'shadow',
    talent_engine: 'ml',
    models: [
      {
        task: 'talent',
        version: 'talento-lr-1',
        algorithm: 'LogisticRegression',
        pr_auc: 0.771,
        rules_pr_auc: 0.629,
        beats_rules: true,
      },
      {
        task: 'injury_risk',
        version: 'lr-1',
        algorithm: 'LogisticRegression',
        pr_auc: 0.045,
        rules_pr_auc: 0.068,
        beats_rules: false,
      },
    ],
  },
  warnings: [],
}

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

function section(name: string) {
  return screen.findByRole('region', { name })
}

beforeAll(async () => {
  await import('@/views/app/dashboard/DashboardView')
})

beforeEach(() => {
  window.localStorage.clear()
  primeAppDataMocks()
  vi.mocked(dashboardService.overview).mockResolvedValue(OVERVIEW)
  vi.mocked(dashboardService.load).mockResolvedValue(LOAD)
  vi.mocked(dashboardService.byCategory).mockResolvedValue(BY_CATEGORY)
  vi.mocked(dashboardService.bySeason).mockResolvedValue(BY_SEASON)
  vi.mocked(dashboardService.injuryRisk).mockResolvedValue(RISK)
  vi.mocked(dashboardService.training).mockResolvedValue(TRAINING)
  vi.mocked(dashboardService.matches).mockResolvedValue(MATCHES)
  vi.mocked(dashboardService.health).mockResolvedValue(HEALTH)
  vi.mocked(dashboardService.development).mockResolvedValue(DEVELOPMENT)
  vi.mocked(dashboardService.ml).mockResolvedValue(ML)
  vi.mocked(dashboardService.summary).mockResolvedValue(SUMMARY)
})

async function tabNames() {
  const tabList = await screen.findByRole('tablist', { name: 'Secciones del tablero' })
  return within(tabList)
    .getAllByRole('tab')
    .map((tab) => tab.textContent)
}

describe('tablero', () => {
  it('muestra a cada rol solo las pestañas que puede ver', async () => {
    const cases: [User, string[]][] = [
      [
        ADMIN_USER,
        [
          'Resumen',
          'General',
          'Entrenamiento',
          'Partidos',
          'Salud',
          'Desarrollo y talento',
          'Modelo de ML',
        ],
      ],
      [
        COACH_USER,
        ['Resumen', 'General', 'Entrenamiento', 'Partidos', 'Salud', 'Desarrollo y talento'],
      ],
      [HEALTH_USER, ['Resumen', 'General', 'Entrenamiento', 'Partidos', 'Salud', 'Modelo de ML']],
      [ATHLETE_USER, ['General', 'Entrenamiento', 'Partidos', 'Desarrollo y talento']],
    ]
    for (const [user, expected] of cases) {
      signInAs(user)
      const view = renderAppAt('/app/tablero')
      expect(await tabNames()).toEqual(expected)
      view.unmount()
    }
  })

  it('muestra en General el resumen, las categorías y la evolución entre temporadas', async () => {
    signInAs(ADMIN_USER)
    renderAppAt('/app/tablero')
    for (const title of [
      'Resumen',
      'Categorías de un vistazo',
      'Por categoría',
      'Evolución entre temporadas',
      'Comparación entre temporadas',
    ])
      expect(await section(title)).toBeInTheDocument()
    expect(dashboardService.training).not.toHaveBeenCalled()
    expect(dashboardService.ml).not.toHaveBeenCalled()
  })

  it('muestra «Datos insuficientes» en vez de ceros cuando no hay registros', async () => {
    signInAs(ADMIN_USER)
    renderAppAt('/app/tablero')

    const overview = await section('Resumen')
    expect(await within(overview).findByText('Datos insuficientes')).toBeInTheDocument()
    expect(
      within(overview).getByText('No hay cargas registradas para este alcance'),
    ).toBeInTheDocument()

    const categories = await section('Por categoría')
    const table = await within(categories).findByRole('table')
    expect(within(table).getAllByText('Datos insuficientes').length).toBeGreaterThan(0)
    expect(within(table).queryByText('0 %')).not.toBeInTheDocument()
    expect(within(table).getByText('61,5 (10)')).toBeInTheDocument()
  })

  it('filtra por categoría al tocarla en la tabla', async () => {
    signInAs(ADMIN_USER)
    renderAppAt('/app/tablero')

    const categories = await section('Por categoría')
    const table = await within(categories).findByRole('table')
    await userEvent.click(within(table).getByRole('button', { name: 'Sub-15' }))
    await waitFor(() =>
      expect(dashboardService.overview).toHaveBeenLastCalledWith({
        id_season: ACTIVE_SEASON.id_season,
        id_category: 4,
      }),
    )
    expect(dashboardService.bySeason).toHaveBeenLastCalledWith({ id_category: 4 })
  })

  it('abre la pestaña indicada en la dirección y carga solo sus datos', async () => {
    signInAs(ADMIN_USER)
    renderAppAt('/app/tablero?tab=entrenamiento')

    expect(await section('Carga y ACWR')).toBeInTheDocument()
    expect(await section('Sesiones y esfuerzo')).toBeInTheDocument()
    expect(dashboardService.training).toHaveBeenCalled()
    expect(dashboardService.byCategory).not.toHaveBeenCalled()
  })

  it('permite ocultar y mostrar series desde la leyenda', async () => {
    signInAs(ADMIN_USER)
    renderAppAt('/app/tablero?tab=partidos')

    const matches = await section('Partidos y competencias')
    const legend = (await within(matches).findAllByRole('list', { name: /Series/ }))[0]
    const goals = within(legend).getByRole('button', { name: 'Goles' })
    expect(goals).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(goals)
    expect(goals).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(within(legend).getByRole('button', { name: 'Asistencias' }))
    expect(within(legend).getByRole('button', { name: 'Asistencias' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(goals)
    expect(goals).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(matches).getByText('15 participaciones en partidos no tienen RPE registrado'),
    ).toBeInTheDocument()
  })

  it('muestra en Salud las lesiones, la lista de atención y los consentimientos', async () => {
    signInAs(HEALTH_USER)
    renderAppAt('/app/tablero?tab=salud')

    expect(await section('Lesiones y alertas')).toBeInTheDocument()
    expect(await screen.findByText('Consentimientos de menores')).toBeInTheDocument()
    expect(screen.getByText(/1 sin consentimiento otorgado/)).toBeInTheDocument()
    const risk = await section('Deportistas que requieren atención')
    expect(await within(risk).findByText('Deportista Uno')).toBeInTheDocument()
    expect(within(risk).getByText('ACWR alto sostenido')).toBeInTheDocument()
  })

  it('no muestra al entrenador los registros de salud ni los consentimientos', async () => {
    signInAs(COACH_USER)
    vi.mocked(dashboardService.health).mockResolvedValue({
      ...HEALTH,
      health_records: null,
      consents: null,
    })
    renderAppAt('/app/tablero?tab=salud')

    expect(await section('Lesiones y alertas')).toBeInTheDocument()
    expect(screen.queryByText('Consentimientos de menores')).not.toBeInTheDocument()
    expect(screen.queryByText('Registros de salud por tipo')).not.toBeInTheDocument()
  })

  it('compara la evaluación física inicial y final indicando si mejora', async () => {
    signInAs(COACH_USER)
    renderAppAt('/app/tablero?tab=desarrollo')

    expect(await screen.findByText('Evaluación física')).toBeInTheDocument()
    expect(screen.getByText(/\+0,9 ml\/kg\/min/)).toBeInTheDocument()
    expect(screen.getByText(/-0,04 s/)).toBeInTheDocument()
    expect(screen.getByText('Sin datos de la temporada anterior para comparar')).toBeInTheDocument()
    expect(screen.getByText(/15 objetivos abiertos ya pasaron su fecha meta/)).toBeInTheDocument()
  })

  it('advierte en la pestaña del modelo el modo sombra y el origen sin verificar', async () => {
    signInAs(HEALTH_USER)
    renderAppAt('/app/tablero?tab=modelo')

    const notes = await screen.findByLabelText('Advertencias del modelo')
    expect(within(notes).getByText(/Modo sombra/)).toBeInTheDocument()
    expect(within(notes).getByText(/Origen sin verificar/)).toBeInTheDocument()
    expect(screen.getByText(/no supera a las reglas/)).toBeInTheDocument()
    expect(screen.getByText(/se muestran las de 2025-1/)).toBeInTheDocument()
    expect(
      screen.getAllByText(/el modelo no hizo predicciones en el periodo/).length,
    ).toBeGreaterThan(0)
  })

  it('le muestra al deportista solo sus datos y nunca la información de equipo', async () => {
    signInAs(ATHLETE_USER)
    vi.mocked(dashboardService.overview).mockResolvedValue({
      ...OVERVIEW,
      filters: { ...SCOPE, athletes_in_scope: 1, own_data_only: true },
    })
    renderAppAt('/app/tablero')

    expect(await screen.findByRole('heading', { name: 'Mi tablero' })).toBeInTheDocument()
    expect(await section('Resumen')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Por categoría' })).not.toBeInTheDocument()
    expect(dashboardService.byCategory).not.toHaveBeenCalled()
    expect(dashboardService.bySeason).not.toHaveBeenCalled()
    expect(dashboardService.health).not.toHaveBeenCalled()
    expect(dashboardService.ml).not.toHaveBeenCalled()
  })

  it('muestra el error de una sección sin romper las demás y permite reintentar', async () => {
    signInAs(ADMIN_USER)
    vi.mocked(dashboardService.bySeason).mockRejectedValue(
      createApiError(400, { status: 'Error', mensaje: 'La categoría indicada no existe' }),
    )
    renderAppAt('/app/tablero')

    const seasons = await section('Comparación entre temporadas')
    expect(await within(seasons).findByRole('alert')).toHaveTextContent(
      'La categoría indicada no existe',
    )
    expect(await section('Resumen')).toBeInTheDocument()
    vi.mocked(dashboardService.bySeason).mockResolvedValue(BY_SEASON)
    await userEvent.click(within(seasons).getByRole('button', { name: /Reintentar/ }))
    expect(await within(seasons).findByRole('table')).toBeInTheDocument()
  })

  it('usa la temporada y la categoría del selector global', async () => {
    signInAs(ADMIN_USER)
    renderAppAt('/app/tablero')

    await waitFor(() =>
      expect(dashboardService.overview).toHaveBeenCalledWith({
        id_season: ACTIVE_SEASON.id_season,
        id_category: undefined,
      }),
    )
    expect(
      await screen.findByText(new RegExp(`Temporada ${ACTIVE_SEASON.name}`)),
    ).toBeInTheDocument()
  })

  it('resume en «Resumen» lo registrado, las alertas, el talento y los modelos', async () => {
    signInAs(ADMIN_USER)
    const { router } = renderAppAt('/app/tablero?tab=resumen')

    const club = await section('Resumen del club')
    expect(await within(club).findByText('2.891')).toBeInTheDocument()
    expect(dashboardService.summary).toHaveBeenCalledWith({})
    expect(within(club).getByText(/23 sin contacto/)).toBeInTheDocument()
    expect(within(club).getByText(/1 administrador · .* · 15 deportistas/)).toBeInTheDocument()
    const alerts = await section('Alertas')
    expect(within(alerts).getByText('2.965')).toBeInTheDocument()
    expect(within(alerts).getByText('Alto 2.264')).toBeInTheDocument()
    const progress = await section('Progreso y talento')
    expect(within(progress).getByText('84,5')).toBeInTheDocument()
    expect(within(progress).getByText('52')).toBeInTheDocument()
    const models = await section('Modelos de ML')
    expect(within(models).getByText('Supera a las reglas')).toBeInTheDocument()
    expect(within(models).getByText('No supera a las reglas')).toBeInTheDocument()
    expect(within(models).getByText(/modo sombra, deciden las reglas/)).toBeInTheDocument()
    await userEvent.click(within(progress).getByRole('button', { name: /Ver ficha/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/app/deportistas/21'))
  })

  it('oculta en «Resumen» lo que el rol no ve en otras pestañas', async () => {
    signInAs(COACH_USER)
    vi.mocked(dashboardService.summary).mockResolvedValue({ ...SUMMARY, users: null, ml: null })
    renderAppAt('/app/tablero?tab=resumen')

    expect(await section('Progreso y talento')).toBeInTheDocument()
    expect(screen.queryByText('Usuarios registrados')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Modelos de ML' })).not.toBeInTheDocument()
  })
})
