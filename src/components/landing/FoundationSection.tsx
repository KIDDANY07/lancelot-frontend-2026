import { BookMarked, CheckCircle2, ExternalLink } from 'lucide-react'
import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { FOUNDATION_CONTENT, FOUNDATION_DECISIONS, LANDING_SECTION_IDS } from '@/constants/landing'

export function FoundationSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.foundation}
      eyebrow={FOUNDATION_CONTENT.eyebrow}
      title={FOUNDATION_CONTENT.title}
      description={FOUNDATION_CONTENT.description}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Reveal className="flex flex-col gap-5 rounded-3xl border-primary/40 glass p-6 sm:p-8 lg:col-span-3">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookMarked aria-hidden="true" className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="w-fit rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
                {FOUNDATION_CONTENT.badge}
              </span>
              <h3 className="text-2xl font-semibold">{FOUNDATION_CONTENT.author}</h3>
              <p className="text-sm text-muted-foreground">{FOUNDATION_CONTENT.authorDetail}</p>
            </div>
          </div>
          <blockquote className="border-l-2 border-primary pl-4 text-sm text-pretty italic">
            {FOUNDATION_CONTENT.citation}
          </blockquote>
          <p className="text-sm text-pretty text-muted-foreground sm:text-base">
            {FOUNDATION_CONTENT.summary}
          </p>
          <a
            href={FOUNDATION_CONTENT.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {FOUNDATION_CONTENT.urlLabel}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </Reveal>
        <Reveal
          delay={0.06}
          className="flex flex-col gap-4 rounded-3xl glass p-6 sm:p-8 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold">{FOUNDATION_CONTENT.decisionsTitle}</h3>
          <ol className="flex flex-col gap-3">
            {FOUNDATION_DECISIONS.map((decision) => (
              <li key={decision} className="flex items-start gap-3 text-sm text-pretty">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{decision}</span>
              </li>
            ))}
          </ol>
          <p className="mt-auto text-xs text-muted-foreground">{FOUNDATION_CONTENT.futureWork}</p>
        </Reveal>
      </div>
    </LandingSection>
  )
}
