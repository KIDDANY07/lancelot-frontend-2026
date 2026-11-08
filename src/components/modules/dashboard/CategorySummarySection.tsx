import { DashboardSection } from '@/components/modules/dashboard/DashboardSection'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DASHBOARD_SECTIONS, INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardSectionState } from '@/controllers/dashboard/useDashboardSection'
import type { CategorySummary, DashboardByCategory } from '@/types/dashboard'
import { formatLoad, formatNumber, formatPercent } from '@/utils/formatNumber'

interface Column {
  label: string
  value: (category: CategorySummary) => string
}

const COLUMNS: Column[] = [
  { label: 'Deportistas', value: (c) => String(c.athletes) },
  { label: 'Sesiones', value: (c) => String(c.sessions) },
  {
    label: 'Carga media',
    value: (c) =>
      c.avg_session_load === null ? INSUFFICIENT_DATA : formatLoad(c.avg_session_load),
  },
  {
    label: 'RPE registrado',
    value: (c) =>
      c.rpe_coverage_pct === null ? INSUFFICIENT_DATA : formatPercent(c.rpe_coverage_pct, 0),
  },
  { label: 'En riesgo', value: (c) => String(c.athletes_at_risk) },
  { label: 'Lesiones', value: (c) => String(c.injuries) },
  {
    label: 'Índice de progreso',
    value: (c) =>
      c.avg_progress_index === null
        ? INSUFFICIENT_DATA
        : `${formatNumber(c.avg_progress_index, 1)} (${c.progress_athletes})`,
  },
  { label: 'Talento por revisar', value: (c) => String(c.open_talent_flags) },
]

interface CategorySummarySectionProps {
  state: DashboardSectionState<DashboardByCategory>
  selectedCategory: number | null
  onSelectCategory: (idCategory: number | null) => void
}

export function CategorySummarySection({
  state,
  selectedCategory,
  onSelectCategory,
}: CategorySummarySectionProps) {
  return (
    <DashboardSection
      id="tablero-categorias"
      {...DASHBOARD_SECTIONS.categories}
      state={state}
      skeleton="table"
      isEmpty={(data) => data.categories.length === 0}
      emptyMessage="La temporada no tiene deportistas asignados ni sesiones registradas."
      warnings={(data) => data.warnings}
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.season && (
            <p className="text-sm text-muted-foreground">Temporada {data.season.name}</p>
          )}
          <ul className="grid grid-cols-1 gap-3 md:hidden">
            {data.categories.map((category) => (
              <li key={category.id_category} className="rounded-2xl glass-subtle p-4">
                <button
                  type="button"
                  className="mb-2 font-semibold underline-offset-4 hover:underline"
                  onClick={() => onSelectCategory(category.id_category)}
                >
                  {category.name}
                </button>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {COLUMNS.map((column) => (
                    <div key={column.label} className="contents">
                      <dt className="text-muted-foreground">{column.label}</dt>
                      <dd className="text-right tabular-nums">{column.value(category)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-2xl glass-subtle p-2 md:block">
            <Table>
              <TableCaption className="sr-only">Indicadores por categoría</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  {COLUMNS.map((column) => (
                    <TableHead key={column.label} className="text-right">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.categories.map((category) => (
                  <TableRow
                    key={category.id_category}
                    data-state={category.id_category === selectedCategory ? 'selected' : undefined}
                  >
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => onSelectCategory(category.id_category)}
                      >
                        {category.name}
                      </Button>
                    </TableCell>
                    {COLUMNS.map((column) => (
                      <TableCell key={column.label} className="text-right tabular-nums">
                        {column.value(category)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => onSelectCategory(null)}
            >
              Ver todas las categorías
            </Button>
          )}
          {data.definitions && (
            <p className="text-xs text-muted-foreground">
              RPE registrado: {data.definitions.rpe_coverage_pct}. Índice de progreso:{' '}
              {data.definitions.avg_progress_index}; entre paréntesis, cuántos deportistas entran en
              el promedio. {data.definitions.athletes}.
            </p>
          )}
        </div>
      )}
    </DashboardSection>
  )
}
