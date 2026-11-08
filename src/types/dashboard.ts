import type { RiskLevel } from '@/constants/riskLevels'

export interface DashboardFilters {
  id_season?: number
  id_category?: number
}

export interface DashboardScope {
  from: string
  to: string
  days: number
  id_season: number | null
  id_category: number | null
  athletes_in_scope: number
  own_data_only: boolean
}

export interface DashboardOverview {
  filters: DashboardScope
  athletes: { in_scope: number; with_load: number }
  sessions: { total: number }
  matches: { total: number }
  load: { loads: number; avg_session_load: number | null; avg_rpe: number | null }
  fatigue_alerts: { open: number; underload: number; overload: number; athletes: number }
  injuries: { active: number; recovering: number; in_period: number }
  last_load_date: string | null
  warnings: string[]
}

export interface LoadSeriesPoint {
  period: string
  loads: number
  athletes_with_load: number
  load_per_athlete: number | null
  avg_rpe: number | null
  acwr_avg: number | null
  acwr_athletes: number
  acwr_zones: { subcarga: number; optima: number; precaucion: number; sobrecarga: number }
}

export interface DashboardLoad {
  filters: DashboardScope
  granularity: 'day' | 'week'
  zones: { low_min: number; low_max: number; medium_max: number; scope: string }
  series: LoadSeriesPoint[]
  warnings: string[]
}

export interface CategorySummary {
  id_category: number
  name: string
  athletes: number
  sessions: number
  avg_session_load: number | null
  avg_rpe: number | null
  rpe_coverage_pct: number | null
  open_alerts: number
  athletes_at_risk: number
  injuries: number
  avg_progress_index: number | null
  progress_athletes: number
  open_talent_flags: number
}

export interface DashboardByCategory {
  filters: DashboardScope
  season: { id_season: number; name: string; status: string } | null
  categories: CategorySummary[]
  definitions?: Record<string, string>
  warnings: string[]
}

export interface SeasonSummary {
  id_season: number
  name: string
  status: string
  start_date: string | null
  end_date: string | null
  athletes: number
  sessions: number
  matches: number
  avg_session_load: number | null
  avg_rpe: number | null
  injuries: number
  avg_progress_index: number | null
  talent_flags: number
}

export interface DashboardBySeason {
  id_category: number | null
  seasons: SeasonSummary[]
  warnings: string[]
}

export interface AthleteAtRisk {
  id_user: number
  athlete: string
  risk_level: Exclude<RiskLevel, 'bajo'>
  last_level: string
  last_date: string | null
  open_days: number
  acwr: number | null
  origin: 'reglas' | 'modelo'
  factors: string[]
}

export interface DashboardInjuryRisk {
  filters: DashboardScope
  counts: { alto: number; medio: number }
  athletes: AthleteAtRisk[]
  warnings: string[]
}

export interface TrainingByType {
  type: string
  label: string
  sessions: number
  planned_minutes: number | null
  actual_minutes: number | null
  loads: number
  avg_session_load: number | null
  avg_rpe: number | null
}

export interface DashboardTraining {
  filters: DashboardScope
  by_type: TrainingByType[]
  by_weekday: { day: number; label: string; sessions: number }[]
  rpe_distribution: { rpe: number; total: number }[]
  warnings: string[]
}

export interface PlayerContribution {
  id_user: number
  athlete: string
  appearances: number
  minutes: number
  goals: number
  assists: number
}

export interface DashboardMatches {
  filters: DashboardScope
  totals: {
    matches: number
    appearances: number
    players: number
    minutes: number
    goals: number
    assists: number
    yellow_cards: number
    red_cards: number
    saves: number
    goals_conceded: number
    avg_minutes: number | null
    avg_rpe: number | null
  }
  monthly: {
    key: string
    matches: number
    goals: number
    assists: number
    avg_rpe: number | null
  }[]
  by_competition: { id_competency: number; name: string; matches: number; goals: number }[]
  top_contributions: PlayerContribution[]
  top_minutes: PlayerContribution[]
  warnings: string[]
}

export interface DashboardHealth {
  filters: DashboardScope
  injuries_monthly: { key: string; contact: number; non_contact: number; unknown: number }[]
  injuries_by_body_part: {
    body_part: string
    total: number
    leve: number
    moderada: number
    severa: number
  }[]
  injuries_by_severity: {
    severity: 'leve' | 'moderada' | 'severa'
    total: number
    avg_days_lost: number | null
    total_days_lost: number
  }[]
  injury_status: { active: number; recovering: number; recovered: number }
  fatigue_weekly: { key: string; overload: number; underload: number; open: number }[]
  risk_weekly: { key: string; medio: number; alto: number }[]
  health_records:
    { condition_type: string; status: string; total: number; restricted: number }[] | null
  consents: {
    by_status: { status: string; total: number }[]
    minors: number
    minors_without_consent: number
  } | null
  underload_threshold: number
  warnings: string[]
}

export interface HistogramBin {
  from: number
  to: number
  total: number
}

export interface DashboardDevelopment {
  filters: DashboardScope
  id_season: number | null
  technical_by_indicator: {
    dimension: 'tecnica' | 'tactica'
    indicator: string
    avg_score: number | null
    evaluations: number
    athletes: number
  }[]
  technical_monthly: { key: string; tecnica: number | null; tactica: number | null }[]
  physical_by_stage: {
    stage: string
    label: string
    evaluations: number
    vo2max: number | null
    speed_20m: number | null
    weight_kg: number | null
    height_cm: number | null
  }[]
  progress: {
    athletes: number
    index_value: number | null
    previous_index: number | null
    components: { key: string; label: string; value: number | null }[]
    distribution: HistogramBin[]
  } | null
  talent_flags: { source: string; open: number; reviewed: number; dismissed: number }[] | null
  objectives: { open: number; achieved: number; missed: number; overdue: number } | null
  warnings: string[]
}

export interface DashboardMlModelRow {
  id_model: number
  version: string
  task: string
  algorithm: string
  is_active: boolean
  created: string | null
  pr_auc: number | null
  roc_auc: number | null
  recall: number | null
  precision: number | null
  rules_pr_auc: number | null
}

export interface ReadinessSummary {
  ready: boolean
  criteria: { code: string; value: number; minimum: number; met: boolean }[]
}

export interface DashboardMl {
  filters: DashboardScope
  engine: {
    engine: string
    talent_engine: string
    prob_medium_threshold: number | null
    prob_high_threshold: number | null
    talent_prob_threshold: number | null
  } | null
  models: DashboardMlModelRow[]
  predictions_daily: {
    key: string
    bajo: number
    medio: number
    alto: number
    avg_probability: number | null
  }[]
  probability_distribution: HistogramBin[]
  labels: { label_quality: string; total: number; positives: number }[]
  readiness: { injury: ReadinessSummary; talent: ReadinessSummary }
  talent_predictions: {
    id_season: number
    season_name: string
    is_selected_season: boolean
    total: number
    rules_flagged: number
    above_threshold: number
    distribution: HistogramBin[]
  } | null
  warnings: string[]
}
