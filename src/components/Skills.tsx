import { Braces, BrainCircuit, Database, Languages, Server, Cpu } from 'lucide-react'
import { skills } from '../data/portfolio'
import { Reveal, SectionHeading, SpotlightCard } from './ui'

const ICONS = [Braces, BrainCircuit, Server, Cpu, Database, Languages]

export function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading
        eyebrow="Toolkit"
        title={
          <>
            The stack behind <span className="text-gradient">the work.</span>
          </>
        }
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Reveal key={s.group} delay={(i % 3) * 0.06}>
              <SpotlightCard className="group h-full p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-display text-lg font-medium">{s.group}</h3>
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate transition-colors duration-300 group-hover:border-cyan/40 group-hover:text-cyan">
                    <Icon size={16} />
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <span key={it} className="chip text-ink/85 transition-colors hover:border-cyan/40 hover:text-cyan">
                      {it}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
