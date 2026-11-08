import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import { cn } from '@/lib/utils'

type Datum = Record<string, unknown>

export interface MultipleMetric {
  key: string
  label: string
  format: (value: number | null) => string
}

interface SmallMultiplesProps<T extends object> {
  data: T[]
  xKey: keyof T & string
  metrics: MultipleMetric[]
  selectedX?: string | null
  onSelect?: (datum: T) => void
  color?: string
}

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

interface MiniTooltipProps extends TooltipRenderProps<Datum> {
  xKey: string
  metric: MultipleMetric
}

function MiniTooltip({ xKey, metric, ...props }: MiniTooltipProps) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={String(datum[xKey])}
      rows={[{ label: metric.label, value: metric.format(numeric(datum[metric.key])) }]}
    />
  )
}

export function SmallMultiples<T extends object>({
  data,
  xKey,
  metrics,
  selectedX,
  onSelect,
  color = 'var(--chart-1)',
}: SmallMultiplesProps<T>) {
  const config = { value: { label: 'Valor', color } } satisfies ChartConfig
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const values = (data as unknown as Datum[]).map((datum) => numeric(datum[metric.key]))
        const last = [...values].reverse().find((value) => value !== null) ?? null
        const hasData = values.some((value) => value !== null)
        return (
          <li key={metric.key} className="flex flex-col gap-1 rounded-2xl glass-subtle p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <p className={cn('font-semibold', !hasData && 'text-xs text-muted-foreground')}>
                {hasData ? metric.format(last) : INSUFFICIENT_DATA}
              </p>
            </div>
            {hasData && (
              <ChartContainer config={config} className="aspect-auto h-24 w-full">
                <LineChart
                  data={data as unknown as Datum[]}
                  margin={{ top: 6, right: 8, bottom: 0, left: 8 }}
                  onClick={(state) => {
                    const index = Number(state?.activeTooltipIndex)
                    const datum = Number.isInteger(index) ? data[index] : undefined
                    if (datum && onSelect) onSelect(datum)
                  }}
                >
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey={String(xKey)} hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    content={<MiniTooltip xKey={xKey} metric={metric} />}
                    cursor={{ stroke: 'var(--border)' }}
                  />
                  <Line
                    dataKey={metric.key}
                    type="monotone"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    connectNulls={false}
                    isAnimationActive={false}
                    cursor={onSelect ? 'pointer' : undefined}
                    dot={(dotProps: { cx?: number; cy?: number; index?: number; payload?: T }) => {
                      const selected =
                        selectedX &&
                        dotProps.payload &&
                        String(dotProps.payload[xKey]) === selectedX
                      if (dotProps.cx === undefined || dotProps.cy === undefined)
                        return <g key={dotProps.index} />
                      return (
                        <circle
                          key={dotProps.index}
                          cx={dotProps.cx}
                          cy={dotProps.cy}
                          r={selected ? 5 : 3}
                          fill={selected ? 'var(--color-value)' : 'var(--background)'}
                          stroke="var(--color-value)"
                          strokeWidth={2}
                        />
                      )
                    }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </li>
        )
      })}
    </ul>
  )
}
