import type { ReactNode } from 'react'
import { ModuleTabs } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { DevelopmentTab } from '@/components/modules/dashboard/tabs/DevelopmentTab'
import { GeneralTab } from '@/components/modules/dashboard/tabs/GeneralTab'
import { HealthTab } from '@/components/modules/dashboard/tabs/HealthTab'
import { MatchesTab } from '@/components/modules/dashboard/tabs/MatchesTab'
import { MlTab } from '@/components/modules/dashboard/tabs/MlTab'
import { TrainingTab } from '@/components/modules/dashboard/tabs/TrainingTab'
import { DATA_ORIGIN_NOTE, type DashboardTab } from '@/constants/dashboard'
import { APP_MODULES, moduleLabel } from '@/constants/navigation'
import type { Permission } from '@/constants/permissions'
import { useDashboardScope } from '@/controllers/dashboard/useDashboardScope'
import { useRole } from '@/hooks/useRole'

interface TabDefinition {
  value: DashboardTab
  label: string
  permission?: Permission
  render: (scope: ReturnType<typeof useDashboardScope>) => ReactNode
}

const TABS: TabDefinition[] = [
  { value: 'general', label: 'General', render: (scope) => <GeneralTab scope={scope} /> },
  {
    value: 'entrenamiento',
    label: 'Entrenamiento',
    render: (scope) => <TrainingTab scope={scope} />,
  },
  { value: 'partidos', label: 'Partidos', render: (scope) => <MatchesTab scope={scope} /> },
  {
    value: 'salud',
    label: 'Salud',
    permission: 'viewDashboardHealth',
    render: (scope) => <HealthTab scope={scope} />,
  },
  {
    value: 'desarrollo',
    label: 'Desarrollo y talento',
    permission: 'viewDashboardDevelopment',
    render: (scope) => <DevelopmentTab scope={scope} />,
  },
  {
    value: 'modelo',
    label: 'Modelo de ML',
    permission: 'viewDashboardMl',
    render: (scope) => <MlTab scope={scope} />,
  },
]

export default function DashboardView() {
  const { role } = useRole()
  const scope = useDashboardScope()
  const tabs = TABS.filter((tab) => !tab.permission || scope.can(tab.permission))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageHeader
          title={moduleLabel(APP_MODULES.dashboard, role)}
          description={
            scope.isAthlete
              ? 'Tu carga, tus partidos y tu desarrollo en la temporada.'
              : 'Todo lo que registra el club, por temporada y categoría. Cámbialas con el selector de la parte superior.'
          }
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {scope.seasonName ? `Temporada ${scope.seasonName}` : 'Todas las temporadas'}
          {!scope.isAthlete && ` · ${scope.categoryName ?? 'Todas las categorías'}`}
          {scope.isAthlete && ' · solo tus datos'}
        </p>
      </div>
      <ModuleTabs
        label="Secciones del tablero"
        defaultTab="general"
        tabs={tabs.map((tab) => ({
          value: tab.value,
          label: tab.label,
          content: tab.render(scope),
        }))}
      />
      <p className="text-xs text-muted-foreground">{DATA_ORIGIN_NOTE}</p>
    </div>
  )
}
