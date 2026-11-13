import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_SECTION_IDS, SOURCE_GROUPS, SOURCES_CONTENT } from '@/constants/landing'
import { cn } from '@/lib/utils'

export function SourcesSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.sources}
      eyebrow={SOURCES_CONTENT.eyebrow}
      title={SOURCES_CONTENT.title}
      description={SOURCES_CONTENT.description}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SOURCE_GROUPS.map((group, index) => (
          <Reveal
            key={group.title}
            delay={index * 0.04}
            className={cn(
              'flex flex-col gap-4 rounded-2xl glass p-6',
              index === 0 && 'md:col-span-2',
            )}
          >
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <ul
              className={cn(
                'grid grid-cols-1 gap-3',
                index === 0 && 'md:grid-cols-2 lg:grid-cols-4',
              )}
            >
              {group.items.map((item) => (
                <li
                  key={item.citation}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl p-4',
                    item.principal ? 'bg-primary/10 ring-1 ring-primary/40' : 'glass-subtle',
                  )}
                >
                  {item.principal && (
                    <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                      Fuente principal
                    </span>
                  )}
                  <p className="text-sm font-semibold">{item.citation}</p>
                  <p className="text-xs text-pretty text-muted-foreground">{item.contribution}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  )
}
