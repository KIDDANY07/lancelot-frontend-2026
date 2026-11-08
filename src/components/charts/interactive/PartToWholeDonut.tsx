import { useState } from 'react'
import { Cell, Label, Pie, PieChart, Tooltip } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent } from '@/utils/formatNumber'

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

interface SliceDatum extends DonutSlice {
  share: number
}

function SliceTooltip(props: TooltipRenderProps<SliceDatum>) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={datum.label}
      rows={[
        { label: 'Total', value: formatNumber(datum.value, 0), color: datum.color },
        { label: 'Porcentaje', value: formatPercent(datum.share, 1) },
      ]}
    />
  )
}

interface PartToWholeDonutProps {
  title: string
  description?: string
  slices: DonutSlice[]
  centerLabel: string
  onSelect?: (key: string) => void
}

export function PartToWholeDonut({
  title,
  description,
  slices,
  centerLabel,
  onSelect,
}: PartToWholeDonutProps) {
  const [active, setActive] = useState<string | null>(null)
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const data: SliceDatum[] = slices.map((slice) => ({
    ...slice,
    share: total ? (slice.value / total) * 100 : 0,
  }))
  const config = Object.fromEntries(
    slices.map((slice) => [slice.key, { label: slice.label, color: slice.color }]),
  ) satisfies ChartConfig

  return (
    <ChartCard
      title={title}
      description={description}
      isEmpty={total === 0}
      emptyMessage={`${INSUFFICIENT_DATA}: no hay registros para este gráfico.`}
      table={
        <DataTableSimple
          caption={title}
          headers={['', 'Total', 'Porcentaje']}
          rows={data.map((datum) => [
            datum.label,
            formatNumber(datum.value, 0),
            formatPercent(datum.share, 1),
          ])}
        />
      }
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <ChartContainer config={config} className="aspect-square h-48 shrink-0">
          <PieChart>
            <Tooltip content={<SliceTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={false}
              onMouseEnter={(_, index) => setActive(data[index]?.key ?? null)}
              onMouseLeave={() => setActive(null)}
              onClick={(_, index) => {
                const key = data[index]?.key
                if (key && onSelect) onSelect(key)
              }}
              cursor={onSelect ? 'pointer' : undefined}
            >
              {data.map((datum) => (
                <Cell
                  key={datum.key}
                  fill={datum.color}
                  opacity={active && active !== datum.key ? 0.45 : 1}
                />
              ))}
              <Label
                position="center"
                content={({ viewBox }) => {
                  const box = viewBox as { cx?: number; cy?: number } | undefined
                  if (!box?.cx || !box.cy) return null
                  return (
                    <text x={box.cx} y={box.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={box.cx}
                        y={box.cy - 6}
                        className="fill-foreground text-xl font-semibold"
                      >
                        {formatNumber(total, 0)}
                      </tspan>
                      <tspan x={box.cx} y={box.cy + 14} className="fill-muted-foreground text-xs">
                        {centerLabel}
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="flex w-full flex-col gap-1.5 text-sm">
          {data.map((datum) => (
            <li
              key={datum.key}
              onMouseEnter={() => setActive(datum.key)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-2 py-1',
                active === datum.key && 'bg-muted',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: datum.color }}
                />
                {datum.label}
              </span>
              <span className="shrink-0 whitespace-nowrap text-muted-foreground">
                {formatNumber(datum.value, 0)} · {formatPercent(datum.share, 0)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
