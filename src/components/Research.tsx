import { BookOpen } from 'lucide-react'
import { publications } from '../data/portfolio'
import { Reveal, SectionHeading, SpotlightCard } from './ui'

export function Research() {
  return (
    <section id="research" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading
        eyebrow="Publications"
        title={
          <>
            Applied ML, <span className="text-gradient">in print.</span>
          </>
        }
      />
      <div className="space-y-4">
        {publications.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <SpotlightCard className="group grid gap-4 p-6 md:grid-cols-[5rem_1fr_auto] md:items-center md:p-8">
              <span className="font-display text-3xl font-semibold text-slate/50 transition-colors group-hover:text-cyan">{p.year}</span>
              <div>
                <h3 className="font-display text-lg leading-snug font-medium text-balance md:text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-slate">
                  {p.authors.split('Chetan Nandanwar').map((part, j, arr) => (
                    <span key={j}>
                      {part}
                      {j < arr.length - 1 && <span className="text-ink">Chetan Nandanwar</span>}
                    </span>
                  ))}
                </p>
                <p className="mt-1 font-mono text-xs text-cyan/80">{p.venue}</p>
              </div>
              <BookOpen size={20} className="hidden text-slate md:block" />
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
