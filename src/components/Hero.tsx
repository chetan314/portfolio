import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/portfolio'
import { scrollToId } from '../lib/scroll'
import { GithubIcon } from './icons'
import { NeuralCanvas } from './NeuralCanvas'
import { Button, EASE } from './ui'

// background-clip:text does not paint through transformed children, so the
// gradient line colours each letter along alabaster → cyan → violet instead.
const STOPS = [
  [244, 244, 246],
  [0, 240, 255],
  [124, 58, 237],
]
function gradientAt(t: number) {
  const seg = t < 0.5 ? 0 : 1
  const k = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5
  const [a, b] = [STOPS[seg], STOPS[seg + 1]]
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(' ')})`
}

function KineticLine({
  text,
  delay = 0,
  className = '',
  gradient = false,
}: {
  text: string
  delay?: number
  className?: string
  gradient?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`} aria-hidden="true">
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          style={gradient ? { color: gradientAt(text.length > 1 ? i / (text.length - 1) : 0) } : undefined}
          initial={reduce ? false : { y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: delay + i * 0.035 }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  )
}

function RotatingWord() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % profile.roles.length), 2600)
    return () => clearInterval(t)
  }, [reduce])
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {/* Invisible longest word reserves width so nothing shifts */}
      <span className="invisible col-start-1 row-start-1">
        {profile.roles.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={profile.roles[i]}
          className="col-start-1 row-start-1 text-cyan"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {profile.roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function ModelCard() {
  const rows: [string, string][] = [
    ['model', '"chetan-nandanwar"'],
    ['program', '"M.Tech Data Science"'],
    ['institute', '"IIT Roorkee"'],
    ['focus', '["vision", "nlp", "retrieval"]'],
    ['publications', '2'],
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE, delay: 1.1 }}
      className="glass w-full max-w-sm rounded-2xl bg-obsidian/60 font-mono text-[12.5px] shadow-[0_30px_80px_-30px_rgb(124_58_237/0.45)]"
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 text-[11px] text-slate">model_card.json</span>
      </div>
      <div className="space-y-1.5 px-4 py-4 leading-relaxed">
        <div className="text-slate">{'{'}</div>
        {rows.map(([k, v]) => (
          <div key={k} className="pl-4">
            <span className="text-violet-300">"{k}"</span>
            <span className="text-slate">: </span>
            <span className={v.startsWith('"') || v.startsWith('[') ? 'text-ink' : 'text-cyan'}>{v}</span>
            <span className="text-slate">,</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pl-4">
          <span className="text-violet-300">"status"</span>
          <span className="text-slate">:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            "open to roles"
          </span>
        </div>
        <div className="text-slate">{'}'}</div>
      </div>
    </motion.div>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section id="top" ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16">
      <div className="absolute inset-0 -z-10">
        <NeuralCanvas />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_30%,rgb(124_58_237/0.18),transparent_70%),radial-gradient(40%_40%_at_15%_80%,rgb(0_240_255/0.08),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
      </div>

      <motion.div style={{ y, opacity: fade }} className="mx-auto grid w-full max-w-6xl items-end gap-12 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="eyebrow mb-6 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-cyan/60" />
            {profile.role}
          </motion.p>

          <h1 className="font-display text-[clamp(3rem,10vw,7.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]">
            <span className="sr-only">{profile.name}</span>
            <KineticLine text="Chetan" delay={0.2} />
            <KineticLine text="Nandanwar" delay={0.4} gradient />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-slate md:text-xl"
          >
            Building <RotatingWord />
            <br />
            {profile.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button
              href="#work"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('work')
              }}
            >
              View my work
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
            <Button variant="ghost" href={`mailto:${profile.email}`}>
              <Mail size={16} /> Get in touch
            </Button>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-slate transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              <GithubIcon />
            </a>
          </motion.div>
        </div>

        <div className="hidden justify-end lg:flex">
          <ModelCard />
        </div>
      </motion.div>

      <motion.a
        href="#about"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('about')
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-slate uppercase md:flex"
      >
        <ArrowDown size={14} className="animate-bounce" /> Scroll
      </motion.a>
    </section>
  )
}
