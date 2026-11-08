import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { SeriesLegend, type ChartSeries } from '@/components/charts/interactive/SeriesLegend'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { GlossaryKey } from '@/constants/glossary'
import { toggleKey } from '@/utils/chartSeries'
import { formatNumber } from '@/utils/formatNumber'

type Datum = Record<string, unknown>

export interface ChartZone {
  key: string
  label: string
  from: number
  to: number
  color: string
}

interface InteractiveLineChartProps<T extends object> {
  title: string
  description?: string
  helpTerm?: GlossaryKey
  data: T[]
  xKey: keyof T & string
  formatX?: (value: string) => string
  formatXLong?: (value: string) => string
  series: ChartSeries[]
  zones?: ChartZone[]
  domain?: [number, number | 'auto']
  formatValue?: (value: number | null) => string
  emptyMessage?: string
  footer?: React.ReactNode
}

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

interface LineTooltipProps extends TooltipRenderProps<Datum> {
  xKey: string
  formatX: (value: string) => string
  series: ChartSeries[]
  formatValue: (value: number | null) => string
}

function LineTooltip({ xKey, formatX, series, formatValue, ...props }: LineTooltipProps) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={formatX(String(datum[xKey]))}
      rows={series.map((item) => ({
        label: item.label,
        value:
          numeric(datum[item.key]) === null ? 'Sin dato' : formatValue(numeric(datum[item.key])),
        color: item.color,
      }))}
    />
  )
}

export function InteractiveLineChart<T extends object>({
  title,
  description,
  helpTerm,
  data,
  xKey,
  formatX = (value) => value,
  formatXLong,
  series,
  zones = [],
  domain,
  formatValue = (value) => formatNumber(value, 2),
  emptyMessage,
  footer,
}: InteractiveLineChartProps<T>) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = series.filter((item) => !hidden.has(item.key))
  const values = (data as unknown as Datum[]).flatMap((datum) =>
    visible
      .map((item) => numeric(datum[item.key]))
      .filter((value): value is number => value !== null),
  )
  const isEmpty = values.length === 0 && hidden.size === 0
  const config = Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }]),
  ) satisfies ChartConfig
  const top = zones.length
    ? Math.max(...zones.map((zone) => zone.from * 1.25), ...values.map((value) => value * 1.1), 0.1)
    : undefined

  return (
    <ChartCard
      title={title}
      description={description}
      helpTerm={helpTerm}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage ?? `${INSUFFICIENT_DATA}: no hay registros para este gráfico.`}
      table={
        <DataTableSimple
          caption={title}
          headers={['', ...series.map((item) => item.label)]}
          rows={(data as unknown as Datum[]).map((datum) => [
            (formatXLong ?? formatX)(String(datum[xKey])),
            ...series.map((item) => formatValue(numeric(datum[item.key]))),
          ])}
        />
      }
      footer={
        <div className="flex flex-col gap-2">
          <SeriesLegend
            series={series}
            hidden={hidden}
            onToggle={(key) => setHidden((current) => toggleKey(current, key, series.length))}
          />
          {zones.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {zones.map((zone) => (
                <li key={zone.key} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-[3px] opacity-60"
                    style={{ backgroundColor: zone.color }}
                  />
                  {zone.label}
                </li>
              ))}
            </ul>
          )}
          {footer}
        </div>
      }
    >
      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        <LineChart
          data={data as unknown as Datum[]}
          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
        >
          {zones.map((zone) => (
            <ReferenceArea
              key={zone.key}
              y1={zone.from}
              y2={Math.min(zone.to, top ?? zone.to)}
              fill={zone.color}
              fillOpacity={0.08}
              stroke="none"
              ifOverflow="hidden"
            />
          ))}
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey={String(xKey)}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickFormatter={(value: string) => formatX(String(value))}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            domain={domain ?? (top ? [0, Number(top.toFixed(1))] : ['auto', 'auto'])}
            tickFormatter={(value: number) => formatValue(value)}
          />
          <Tooltip
            content={
              <LineTooltip
                xKey={xKey}
                formatX={formatXLong ?? formatX}
                series={visible}
                formatValue={formatValue}
              />
            }
            cursor={{ stroke: 'var(--border)' }}
          />
          {visible.map((item) => (
            <Line
              key={item.key}
              dataKey={item.key}
              name={item.label}
              type="monotone"
              stroke={`var(--color-${item.key})`}
              strokeWidth={2}
              dot={
                data.length <= 12
                  ? { r: 3, strokeWidth: 0, fill: `var(--color-${item.key})` }
                  : false
              }
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}
