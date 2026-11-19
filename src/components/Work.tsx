import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { projects, type DemoKind, type Project, type Tone } from '../data/portfolio'
import { EASE } from '../lib/motion'
import { lockScroll } from '../lib/scroll'
import { Reveal, SectionHead } from './ui'

const demos: Record<DemoKind, LazyExoticComponent<ComponentType>> = {
  rag: lazy(() => import('./demos/RagDemo')),
  retina: lazy(() => import('./demos/RetinaDemo')),
  surgical: lazy(() => import('./demos/SurgicalDemo')),
  pipeline: lazy(() => import('./demos/PipelineDemo')),
}

const TONES: Record<Tone, { bg: string; text: string; sub: string; line: string; stroke: string; btn: string }> = {
  blue: { bg: 'bg-blue', text: 'text-paper', sub: 'text-paper/80', line: 'border-paper', stroke: '#faf9f6', btn: 'bg-acid text-ink' },
  orange: { bg: 'bg-orange', text: 'text-ink', sub: 'text-ink/75', line: 'border-ink', stroke: '#171717', btn: 'bg-paper-2 text-ink' },
  acid: { bg: 'bg-acid', text: 'text-ink', sub: 'text-ink/75', line: 'border-ink', stroke: '#171717', btn: 'bg-blue text-paper' },
  ink: { bg: 'bg-ink', text: 'text-paper', sub: 'text-paper/75', line: 'border-paper', stroke: '#faf9f6', btn: 'bg-acid text-ink' },
}

function DemoFallback() {
  return (
    <div className="brut flex aspect-[4/3] items-center justify-center bg-paper-2">
      <span className="label text-muted">loading demo…</span>
    </div>
  )
}

function ProjectCard({ p, i, onOpen }: { p: Project; i: number; onOpen: (p: Project, el: HTMLElement) => void }) {
  const t = TONES[p.tone]
  const Demo = demos[p.demo]
  const flip = i % 2 === 1

  return (
    <Reveal className={i % 2 ? 'lg:ml-[6%]' : 'lg:mr-[6%]'}>
      <article className={`brut relative isolate ${t.text}`} aria-labelledby={`p-${p.id}`}>
        <motion.div layoutId={`bg-${p.id}`} className={`absolute inset-0 -z-10 ${t.bg}`} transition={{ duration: 0.7, ease: EASE }} />
        <div className={`label flex items-center justify-between border-b-2 px-4 py-2.5 md:px-6 ${t.line}`}>
          <span>
            {p.code} — {p.org}
          </span>
          <span className="hidden sm:inline">{p.period}</span>
        </div>

        <div className={`flex items-start justify-between gap-4 border-b-2 px-4 pb-5 pt-6 md:px-6 lg:px-8 lg:pt-8 ${t.line}`}>
          <div className="min-w-0">
            <motion.h3
              layoutId={`title-${p.id}`}
              id={`p-${p.id}`}
              className="display text-[clamp(1.75rem,7.4vw,6.75rem)] [overflow-wrap:anywhere]"
              transition={{ duration: 0.7, ease: EASE }}
            >
              {p.title}
            </motion.h3>
            <p className="serif-i mt-2 text-[clamp(1.35rem,2.2vw,2rem)] leading-tight">{p.kicker}</p>
          </div>
          <span
            aria-hidden="true"
            className="display hidden shrink-0 text-[clamp(3rem,7vw,6.5rem)] sm:block"
            style={{ color: 'transparent', WebkitTextStroke: `2px ${t.stroke}` }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="grid gap-8 p-4 md:p-6 lg:grid-cols-12 lg:gap-10 lg:p-8">
          <div className={`flex flex-col lg:col-span-5 ${flip ? 'lg:order-2' : ''}`}>
            <p className={`max-w-[48ch] text-[16px] leading-relaxed ${t.sub}`}>{p.summary}</p>

            <div className={`mt-6 flex items-end gap-4 border-t-2 pt-4 ${t.line}`}>
              <span className="display text-[clamp(2rem,3.4vw,3rem)] leading-none">{p.metric.value}</span>
              <span className="label pb-1">{p.metric.label}</span>
            </div>

            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
              {p.tags.map((tag) => (
                <li key={tag} className={`label border-2 px-2 py-1 ${t.line}`}>
                  {tag}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <button
                onClick={(e) => onOpen(p, e.currentTarget)}
                data-cursor="OPEN"
                className={`brut-sm brut-hover flex items-center gap-2 px-4 py-3 text-[14px] font-semibold ${t.btn}`}
              >
                Read case study <ArrowUpRight size={16} />
              </button>
              {p.links?.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="brut-sm brut-hover flex items-center gap-2 bg-paper-2 px-4 py-3 text-[14px] font-semibold text-ink"
                >
                  {l.label} <ArrowUpRight size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className={`min-w-0 lg:col-span-7 ${flip ? 'lg:order-1' : ''}`}>
            <p className="label mb-3 flex items-center gap-2">
              <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 ${p.tone === 'acid' ? 'bg-blue' : 'bg-acid'} border border-ink`} />
              {p.demoNote}
            </p>
            <Suspense fallback={<DemoFallback />}>
              <Demo />
            </Suspense>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

function CaseStudy({ p, onClose }: { p: Project; onClose: () => void }) {
  const t = TONES[p.tone]
  const close = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    lockScroll(true)
    close.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] p-2 md:p-6" role="dialog" aria-modal="true" aria-labelledby={`cs-${p.id}`}>
      <motion.div
        className="absolute inset-0 bg-ink/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className={`brut relative isolate h-full overflow-hidden ${t.text}`}>
        <motion.div layoutId={`bg-${p.id}`} className={`absolute inset-0 -z-10 ${t.bg}`} transition={{ duration: 0.7, ease: EASE }} />
        <div className="h-full overflow-y-auto overscroll-contain" data-lenis-prevent>
          <div className={`label sticky top-0 z-10 flex items-center justify-between border-b-2 px-4 py-3 md:px-8 ${t.line} ${t.bg}`}>
            <span>
              {p.code} — Case study
            </span>
            <button
              ref={close}
              onClick={onClose}
              className="brut-sm flex items-center gap-2 bg-paper-2 px-3 py-1.5 text-ink"
              data-cursor="CLOSE"
            >
              Close <X size={14} />
            </button>
          </div>

          <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-8 md:py-16">
            <motion.h2
              layoutId={`title-${p.id}`}
              id={`cs-${p.id}`}
              className="display break-words text-[clamp(2.5rem,7.6vw,7rem)]"
              transition={{ duration: 0.7, ease: EASE }}
            >
              {p.title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
            >
              <p className="serif-i mt-4 text-[clamp(1.5rem,3vw,2.5rem)] leading-tight">{p.kicker}</p>
              <dl className={`label mt-8 grid grid-cols-2 gap-4 border-y-2 py-4 md:grid-cols-4 ${t.line}`}>
                <div>
                  <dt className="opacity-70">Org</dt>
                  <dd className="mt-1 normal-case tracking-normal">{p.org}</dd>
                </div>
                <div>
                  <dt className="opacity-70">When</dt>
                  <dd className="mt-1 normal-case tracking-normal">{p.period}</dd>
                </div>
                <div>
                  <dt className="opacity-70">Key result</dt>
                  <dd className="mt-1 normal-case tracking-normal">
                    {p.metric.value} — {p.metric.label}
                  </dd>
                </div>
                <div>
                  <dt className="opacity-70">Stack</dt>
                  <dd className="mt-1 normal-case tracking-normal">{p.tags.slice(0, 4).join(', ')}</dd>
                </div>
              </dl>

              <div className="mt-12 grid gap-10 md:grid-cols-12">
                <section className="md:col-span-4">
                  <h3 className="label mb-3">01 / Problem</h3>
                  <p className="text-[17px] leading-relaxed">{p.caseStudy.problem}</p>
                </section>
                <section className="md:col-span-8">
                  <h3 className="label mb-3">02 / Approach</h3>
                  <ol className="space-y-4">
                    {p.caseStudy.approach.map((a, i) => (
                      <li key={a} className={`grid grid-cols-[auto_1fr] gap-4 border-t-2 pt-4 ${t.line}`}>
                        <span className="display text-3xl leading-none">{i + 1}</span>
                        <span className="text-[17px] leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <section className="brut mt-12 bg-paper-2 p-6 text-ink md:p-8">
                <h3 className="label mb-3 text-muted">03 / Outcome</h3>
                <p className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold leading-snug tracking-tight">
                  {p.caseStudy.outcome}
                </p>
              </section>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Work() {
  const [open, setOpen] = useState<Project | null>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const closeCs = useCallback(() => setOpen(null), [])

  return (
    <section id="work" className="container-x scroll-mt-16 py-20 md:py-28" aria-labelledby="work-title">
      <SectionHead index="03" label="Selected work" note={`(${String(projects.length).padStart(2, '0')}) — every card has a live demo`}>
        <span id="work-title">
          Selected <span className="serif-i text-blue">work</span>
          <span className="label ml-3 align-top text-[14px] tracking-normal text-muted">({String(projects.length).padStart(2, '0')})</span>
        </span>
      </SectionHead>

      <div className="flex flex-col gap-14 md:gap-20">
        {projects.map((p, i) => (
          <ProjectCard
            key={p.id}
            p={p}
            i={i}
            onOpen={(proj, el) => {
              trigger.current = el
              setOpen(proj)
            }}
          />
        ))}
      </div>

      {/* portal: escape <main>'s stacking context so the dialog sits above the nav */}
      {createPortal(
        <AnimatePresence onExitComplete={() => trigger.current?.focus({ preventScroll: true })}>
          {open && <CaseStudy key={open.id} p={open} onClose={closeCs} />}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  )
}
