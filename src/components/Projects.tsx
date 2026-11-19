import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { projects, type Project } from '../data/portfolio'
import { RagPlayground } from './demos/RagPlayground'
import { RetinaDemo } from './demos/RetinaDemo'
import { PipelineDemo, SurgicalDemo } from './demos/SmallDemos'
import { Reveal, SectionHeading, SpotlightCard } from './ui'

function Meta({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate">
      <span className="text-cyan">{p.org}</span>
      <span className="h-1 w-1 rounded-full bg-slate/50" />
      <span>{p.period}</span>
    </div>
  )
}

function Body({ p, compact = false }: { p: Project; compact?: boolean }) {
  return (
    <>
      <Meta p={p} />
      <h3 className="mt-3 font-display text-2xl leading-tight font-semibold tracking-tight md:text-[1.7rem]">{p.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-slate">{p.summary}</p>
      {!compact && (
        <ul className="mt-5 space-y-2 text-sm text-ink/85">
          {p.points.map((pt) => (
            <li key={pt} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" />
              {pt}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {p.tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
      {p.links && p.links.length > 0 && (
        <div className="mt-5 flex gap-4">
          {p.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-ink hover:text-cyan">
              {l.label} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      )}
    </>
  )
}

function MetricBadge({ p }: { p: Project }) {
  if (!p.metric) return null
  return (
    <div className="text-right">
      <div className="font-display text-3xl font-semibold text-ink">{p.metric.value}</div>
      <div className="font-mono text-[10.5px] text-slate">{p.metric.label}</div>
    </div>
  )
}

function Card({ className, children, delay = 0 }: { className: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <SpotlightCard className="h-full p-6 md:p-8">{children}</SpotlightCard>
    </Reveal>
  )
}

export function Projects() {
  const [rag, retina, surgical, forage] = projects
  return (
    <section id="work" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading
        eyebrow="Selected work"
        title={
          <>
            Systems that retrieve, <span className="text-gradient">see</span> and clean.
          </>
        }
        intro="Four projects across language, vision and data engineering. The first two include live demos that run entirely in your browser."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Featured: RAG with playground */}
        <Card className="lg:col-span-3">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
            <div className="flex flex-col">
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="chip border-cyan/30 text-cyan">Featured · live demo</span>
                <MetricBadge p={rag} />
              </div>
              <Body p={rag} />
            </div>
            <RagPlayground />
          </div>
        </Card>

        <Card className="lg:col-span-2" delay={0.05}>
          <div className="grid items-center gap-8 md:grid-cols-[1fr_1fr]">
            <RetinaDemo />
            <div>
              <div className="mb-5 flex items-start justify-between gap-4">
                <span className="chip border-cyan/30 text-cyan">Interactive</span>
                <MetricBadge p={retina} />
              </div>
              <Body p={retina} />
            </div>
          </div>
        </Card>

        <Card className="" delay={0.1}>
          <div className="flex h-full flex-col">
            <div className="mb-5 flex justify-end">
              <MetricBadge p={surgical} />
            </div>
            <Body p={surgical} compact />
            <div className="mt-auto pt-8">
              <SurgicalDemo />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3" delay={0.15}>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <div className="mb-5 flex justify-end lg:hidden">
                <MetricBadge p={forage} />
              </div>
              <Body p={forage} />
            </div>
            <div>
              <div className="mb-6 hidden justify-end lg:flex">
                <MetricBadge p={forage} />
              </div>
              <PipelineDemo />
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
