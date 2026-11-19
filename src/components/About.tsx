import { animate, useInView, useReducedMotion } from 'framer-motion'
import { GraduationCap, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { about, education, profile, stats } from '../data/portfolio'
import { Reveal, SpotlightCard } from './ui'

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(0, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, reduce, value])
  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  )
}

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <SpotlightCard className="h-full overflow-hidden p-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={640}
                height={640}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover grayscale-[35%] transition-[filter,transform] duration-700 hover:scale-[1.03] hover:grayscale-0"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                <span className="chip bg-void/60 backdrop-blur">
                  <MapPin size={12} /> {profile.location}
                </span>
                <span className="chip bg-void/60 backdrop-blur">
                  <GraduationCap size={12} /> IIT Roorkee
                </span>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={0.1}>
          <SpotlightCard className="flex h-full flex-col justify-between p-7 md:p-10">
            <div>
              <p className="eyebrow mb-5">About</p>
              <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
                Data first, models second, <span className="text-gradient">shipping always.</span>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate md:text-lg">
                {about.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {about.focus.map((f) => (
                <span key={f} className="chip text-ink">
                  {f}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <SpotlightCard className="h-full p-6">
              <div className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm leading-snug text-slate">{s.label}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {education.map((e, i) => (
          <Reveal key={e.school} delay={i * 0.07}>
            <SpotlightCard className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-xs text-slate">{e.year}</p>
                <p className="mt-1 font-display text-lg font-medium">{e.degree}</p>
                <p className="text-sm text-slate">{e.school}</p>
              </div>
              <span className="chip shrink-0 text-cyan">{e.score}</span>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
