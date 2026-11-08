import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { SeriesLegend, type ChartSeries } from '@/components/charts/interactive/SeriesLegend'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { GlossaryKey } from '@/constants/glossary'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import { toggleKey } from '@/utils/chartSeries'
import { formatNumber } from '@/utils/formatNumber'

type Datum = Record<string, unknown>

export interface InteractiveBarChartProps<T extends object> {
  title: string
  description?: string
  helpTerm?: GlossaryKey
  data: T[]
  categoryKey: keyof T & string
  formatCategory?: (value: string) => string
  series: ChartSeries[]
  stacked?: boolean
  horizontal?: boolean
  formatValue?: (value: number | null) => string
  emptyMessage?: string
  onSelect?: (datum: T) => void
  selectHint?: string
  footer?: React.ReactNode
  height?: number
  valueDomain?: [number, number]
  integerValues?: boolean
}

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

interface BarTooltipProps extends TooltipRenderProps<Datum> {
  categoryKey: string
  formatCategory: (value: string) => string
  series: ChartSeries[]
  formatValue: (value: number | null) => string
  selectHint?: string
}

function BarTooltip({
  categoryKey,
  formatCategory,
  series,
  formatValue,
  selectHint,
  ...props
}: BarTooltipProps) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={formatCategory(String(datum[categoryKey]))}
      rows={series.map((item) => ({
        label: item.label,
        value: formatValue(numeric(datum[item.key])),
        color: item.color,
      }))}
      footer={selectHint ? <p className="pt-1 text-muted-foreground">{selectHint}</p> : undefined}
    />
  )
}

export function InteractiveBarChart<T extends object>({
  title,
  description,
  helpTerm,
  data,
  categoryKey,
  formatCategory = (value) => value,
  series,
  stacked = false,
  horizontal = false,
  formatValue = (value) => formatNumber(value, 1),
  emptyMessage,
  onSelect,
  selectHint,
  footer,
  height,
  valueDomain,
  integerValues = false,
}: InteractiveBarChartProps<T>) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = series.filter((item) => !hidden.has(item.key))
  const isEmpty =
    data.length === 0 ||
    (data as unknown as Datum[]).every((datum) => series.every((item) => !numeric(datum[item.key])))
  const config = Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }]),
  ) satisfies ChartConfig
  const chartHeight = height ?? (horizontal ? Math.max(140, data.length * 30 + 36) : 256)
  const categoryWidth = horizontal
    ? Math.min(
        160,
        Math.max(
          64,
          ...(data as unknown as Datum[]).map(
            (datum) => formatCategory(String(datum[categoryKey])).length * 7,
          ),
        ),
      )
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
            formatCategory(String(datum[categoryKey])),
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
          {footer}
        </div>
      }
    >
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height: chartHeight }}
      >
        <BarChart
          data={data as unknown as Datum[]}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 12, bottom: 0, left: horizontal ? 4 : -8 }}
          barCategoryGap={horizontal ? '24%' : '18%'}
        >
          <CartesianGrid horizontal={!horizontal} vertical={horizontal} stroke="var(--border)" />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                allowDecimals={!integerValues}
                domain={valueDomain}
              />
              <YAxis
                type="category"
                dataKey={String(categoryKey)}
                tickLine={false}
                axisLine={false}
                width={categoryWidth}
                tickFormatter={(value: string) => formatCategory(String(value))}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={String(categoryKey)}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
                tickFormatter={(value: string) => formatCategory(String(value))}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                allowDecimals={!integerValues}
                domain={valueDomain}
              />
            </>
          )}
          <Tooltip
            content={
              <BarTooltip
                categoryKey={categoryKey}
                formatCategory={formatCategory}
                series={visible}
                formatValue={formatValue}
                selectHint={selectHint}
              />
            }
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
          />
          {visible.map((item, index) => {
            const isOuter = !stacked || index === visible.length - 1
            const radius: [number, number, number, number] = horizontal
              ? [0, isOuter ? 4 : 0, isOuter ? 4 : 0, 0]
              : [isOuter ? 4 : 0, isOuter ? 4 : 0, 0, 0]
            return (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                stackId={stacked ? 'total' : undefined}
                fill={`var(--color-${item.key})`}
                radius={radius}
                stroke={stacked ? 'var(--background)' : undefined}
                strokeWidth={stacked ? 1 : 0}
                maxBarSize={horizontal ? 22 : 36}
                isAnimationActive={false}
                cursor={onSelect ? 'pointer' : undefined}
                onClick={
                  onSelect
                    ? (entry: { payload?: T }) => {
                        if (entry.payload) onSelect(entry.payload)
                      }
                    : undefined
                }
              />
            )
          })}
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
