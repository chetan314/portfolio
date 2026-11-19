import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { epochs, type Epoch } from '../data/portfolio'
import { Reveal, SectionHead } from './ui'

const KIND: Record<Epoch['kind'], { bg: string; tag: string }> = {
  education: { bg: 'bg-paper-2 text-ink', tag: 'bg-ink text-paper' },
  work: { bg: 'bg-blue text-paper', tag: 'bg-acid text-ink' },
  research: { bg: 'bg-acid text-ink', tag: 'bg-blue text-paper' },
  leadership: { bg: 'bg-orange text-ink', tag: 'bg-paper-2 text-ink' },
  project: { bg: 'bg-paper text-ink', tag: 'bg-orange text-ink' },
}

function useMedia(q: string) {
  const [m, setM] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(q)
    setM(mq.matches)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

function EpochCard({ e, i, className = '' }: { e: Epoch; i: number; className?: string }) {
  const k = KIND[e.kind]
  return (
    <article className={`brut flex flex-col shadow-[6px_6px_0_0_var(--color-paper)]! ${k.bg} ${className}`}>
      <div className="label flex items-center justify-between border-b-2 border-ink px-4 py-2">
        <span>
          Epoch {String(i + 1).padStart(2, '0')}/{String(epochs.length).padStart(2, '0')}
        </span>
        <span className={`px-1.5 py-0.5 ${k.tag}`}>{e.kind}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="label opacity-80">{e.period}</span>
        <h3 className="display mt-2 text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[0.95]">{e.role}</h3>
        <p className="serif-i mt-1 text-[20px] leading-tight">{e.org}</p>
        <ul className="mt-4 space-y-2 text-[14px] leading-snug">
          {e.points.map((p) => (
            <li key={p} className="grid grid-cols-[14px_1fr] gap-1">
              <span aria-hidden="true">→</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <span className="label mt-auto pt-5 opacity-80">loss = {e.loss.toFixed(2)}</span>
      </div>
    </article>
  )
}

function Horizontal() {
  const outer = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 })
  const x = useTransform(p, (v) => -v * dist)

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth + 64))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const CARD = 400
  const GAP = 32
  const n = epochs.length
  const w = n * CARD + (n - 1) * GAP
  const pts = epochs.map((e, i) => `${i * (CARD + GAP) + CARD / 2},${10 + e.loss * 70}`).join(' ')

  return (
    <div ref={outer} style={{ height: `calc(100vh + ${dist}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-14">
        <motion.div ref={track} style={{ x }} className="pl-[max(48px,calc((100vw-1440px)/2+48px))] will-change-transform">
          <div className="relative" style={{ width: w }}>
            <svg width={w} height={90} className="mb-4 block overflow-visible" aria-hidden="true">
              <line x1={0} y1={85} x2={w} y2={85} stroke="#faf9f6" strokeOpacity={0.25} strokeWidth={2} />
              <motion.polyline points={pts} fill="none" stroke="#dfff00" strokeWidth={3} style={{ pathLength: p }} />
              {epochs.map((e, i) => (
                <g key={i}>
                  <rect x={i * (CARD + GAP) + CARD / 2 - 5} y={10 + e.loss * 70 - 5} width={10} height={10} fill="#171717" stroke="#dfff00" strokeWidth={2} />
                  <text x={i * (CARD + GAP) + CARD / 2 + 12} y={10 + e.loss * 70 - 8} fill="#faf9f6" fontSize={11} fontFamily="JetBrains Mono, monospace">
                    {e.loss.toFixed(2)}
                  </text>
                </g>
              ))}
            </svg>
            <div className="flex items-stretch" style={{ gap: GAP }}>
              {epochs.map((e, i) => (
                <EpochCard key={i} e={e} i={i} className="shrink-0" />
              ))}
            </div>
          </div>
        </motion.div>
        <div className="container-x label mt-8 flex items-center justify-between text-paper/70">
          <span>train_loss ↓ as experience ↑</span>
          <span>scroll →</span>
        </div>
      </div>
    </div>
  )
}

export default function TrainingLog() {
  const wide = useMedia('(min-width: 1024px)')
  const reduce = useReducedMotion()
  const horizontal = wide && !reduce

  return (
    <section id="log" className="scroll-mt-14 bg-ink text-paper" aria-labelledby="log-title">
      <div className="container-x pt-20 md:pt-28">
        <SectionHead index="04" label="Training log" note="experience · education · leadership" dark>
          <span id="log-title">
            Training <span className="serif-i text-acid">log</span>
          </span>
        </SectionHead>
      </div>

      {horizontal ? (
        <div className="[&_article]:w-[400px]">
          <Horizontal />
        </div>
      ) : (
        <div className="container-x pb-20">
          <ol className="relative grid gap-6 border-l-2 border-paper/30 pl-6 md:grid-cols-2 md:border-l-0 md:pl-0">
            {epochs.map((e, i) => (
              <li key={i} className="relative">
                <span aria-hidden="true" className="absolute -left-[31px] top-6 h-3 w-3 border-2 border-acid bg-ink md:hidden" />
                <Reveal delay={(i % 2) * 0.08}>
                  <EpochCard e={e} i={i} className="h-full" />
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      )}
      {horizontal && <div className="h-20" />}
    </section>
  )
}
