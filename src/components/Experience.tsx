import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Briefcase, FlaskConical, Users } from 'lucide-react'
import { useRef, useState } from 'react'
import { experience, type TimelineItem } from '../data/portfolio'
import { EASE, SectionHeading, SpotlightCard } from './ui'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Industry' },
  { id: 'research', label: 'Research' },
  { id: 'leadership', label: 'Leadership' },
] as const
type Filter = (typeof FILTERS)[number]['id']

const ICON: Record<TimelineItem['kind'], typeof Briefcase> = {
  work: Briefcase,
  research: FlaskConical,
  leadership: Users,
}

export function Experience() {
  const [filter, setFilter] = useState<Filter>('all')
  const listRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const items = experience.filter((e) => filter === 'all' || e.kind === filter)

  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading
        eyebrow="Experience"
        title={
          <>
            Industry, lab and <span className="text-gradient">campus.</span>
          </>
        }
      />

      <div role="tablist" aria-label="Filter experience" className="glass mb-10 inline-flex flex-wrap rounded-2xl p-1 sm:rounded-full">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`relative rounded-full px-4 py-2 text-sm transition-colors ${filter === f.id ? 'text-void' : 'text-slate hover:text-ink'}`}
          >
            {filter === f.id && (
              <motion.span layoutId="exp-filter" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
            )}
            {f.label}
          </button>
        ))}
      </div>

      <div ref={listRef} className="relative pl-8 md:pl-12">
        <div className="absolute top-2 bottom-2 left-[11px] w-px bg-line md:left-[15px]" />
        <motion.div
          style={{ scaleY: progress }}
          className="absolute top-2 bottom-2 left-[11px] w-px origin-top bg-gradient-to-b from-cyan via-violet to-transparent md:left-[15px]"
        />

        <motion.ol layout className="space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((e) => {
              const Icon = ICON[e.kind]
              return (
                <motion.li
                  key={e.role + e.org}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative"
                >
                  <span className="absolute top-7 -left-8 grid h-6 w-6 place-items-center rounded-full border border-line bg-obsidian text-cyan md:-left-12 md:h-8 md:w-8">
                    <Icon size={13} />
                  </span>
                  <SpotlightCard className="p-6 md:p-8">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-baseline">
                      <div>
                        <h3 className="font-display text-xl font-semibold md:text-2xl">{e.role}</h3>
                        <p className="text-sm text-cyan">{e.org}</p>
                      </div>
                      <span className="font-mono text-xs text-slate">{e.period}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-slate">
                      {e.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-violet" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </motion.ol>
      </div>
    </section>
  )
}
