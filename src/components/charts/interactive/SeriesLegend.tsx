import { cn } from '@/lib/utils'

export interface ChartSeries {
  key: string
  label: string
  color: string
}

interface SeriesLegendProps {
  series: ChartSeries[]
  hidden: ReadonlySet<string>
  onToggle: (key: string) => void
}

export function SeriesLegend({ series, hidden, onToggle }: SeriesLegendProps) {
  if (series.length < 2) return null
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Series (pulsa para mostrar u ocultar)">
      {series.map((item) => {
        const visible = !hidden.has(item.key)
        return (
          <li key={item.key}>
            <button
              type="button"
              aria-pressed={visible}
              onClick={() => onToggle(item.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-opacity',
                visible ? 'text-foreground' : 'text-muted-foreground opacity-60',
              )}
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-[3px]"
                style={{
                  backgroundColor: visible ? item.color : 'transparent',
                  borderColor: item.color,
                  borderWidth: 1,
                }}
              />
              {item.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
