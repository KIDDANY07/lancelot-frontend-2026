import { DatabaseZap, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { INSUFFICIENT_DATA } from '@/constants/dashboard'
import type { DashboardSectionState } from '@/controllers/dashboard/useDashboardSection'

interface DashboardSectionProps<T> {
  id: string
  title: string
  description: string
  state: DashboardSectionState<T>
  skeleton?: 'cards' | 'list' | 'table'
  isEmpty?: (data: T) => boolean
  emptyMessage?: string
  warnings?: (data: T) => string[]
  children: (data: T) => ReactNode
}

export function SectionNotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null
  return (
    <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground" aria-label="Observaciones">
      {notes.map((note) => (
        <li key={note} className="flex items-start gap-2">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  )
}

export function DashboardSection<T>({
  id,
  title,
  description,
  state,
  skeleton = 'cards',
  isEmpty,
  emptyMessage,
  warnings,
  children,
}: DashboardSectionProps<T>) {
  const headingId = `${id}-titulo`
  let body: ReactNode
  if (state.isLoading)
    body = <LoadingSkeleton variant={skeleton} label={`Cargando ${title.toLowerCase()}…`} />
  else if (state.errorMessage)
    body = (
      <ErrorState
        message={state.errorMessage}
        onRetry={state.retry}
        isRetrying={state.isFetching}
      />
    )
  else if (!state.data) body = null
  else if (isEmpty?.(state.data))
    body = (
      <EmptyState
        icon={DatabaseZap}
        title={INSUFFICIENT_DATA}
        description={
          emptyMessage ?? 'No hay registros suficientes en el periodo para calcular esta sección.'
        }
      />
    )
  else
    body = (
      <>
        {children(state.data)}
        <SectionNotes notes={warnings?.(state.data) ?? []} />
      </>
    )

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-busy={state.isLoading}
      className="flex flex-col gap-4"
    >
      <header>
        <h2 id={headingId} className="font-heading text-xl font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      {body}
    </section>
  )
}
