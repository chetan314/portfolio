import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { EASE } from '../lib/motion'

/* ─────────────────────────────────────────────────────── Section header */
export function SectionHead({
  index,
  label,
  note,
  children,
  dark = false,
}: {
  index: string
  label: string
  note?: string
  children: ReactNode
  dark?: boolean
}) {
  return (
    <header className="mb-10 md:mb-16">
      <div
        className={`flex items-end justify-between gap-4 border-b-2 pb-3 ${dark ? 'border-paper' : 'border-ink'}`}
      >
        <div className="flex items-end gap-3">
          <span
            aria-hidden="true"
            className={`display text-[56px] md:text-[88px] ${dark ? 'text-paper' : ''}`}
            style={{ lineHeight: 0.8 }}
          >
            {index}
          </span>
          <span className={`label pb-1 ${dark ? 'text-paper/70' : 'text-muted'}`}>/ {label}</span>
        </div>
        {note && (
          <span className={`label hidden pb-1 text-right sm:block ${dark ? 'text-paper/70' : 'text-muted'}`}>
            {note}
          </span>
        )}
      </div>
      <Reveal>
        <h2
          className={`display mt-6 text-[clamp(2.75rem,8vw,7.5rem)] ${dark ? 'text-paper' : ''}`}
        >
          {children}
        </h2>
      </Reveal>
    </header>
  )
}

/* ───────────────────────────────────────────────────── Scroll reveal */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────────────────────────────── Kinetic per-letter text reveal */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.035,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
}) {
  return (
    <span className={className} aria-label={text} role="text">
      {text.split('').map((ch, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.04em' }}>
          <motion.span
            className="inline-block"
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * stagger }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* ──────────────────────────────────────────────────── Magnetic wrapper */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })

  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────── Sticker label */
export function Sticker({
  children,
  tone = 'acid',
  rotate = -3,
  className = '',
}: {
  children: ReactNode
  tone?: 'acid' | 'blue' | 'orange' | 'paper' | 'red' | 'ink'
  rotate?: number
  className?: string
}) {
  const tones = {
    acid: 'bg-acid text-ink',
    blue: 'bg-blue text-paper',
    orange: 'bg-orange text-ink',
    paper: 'bg-paper-2 text-ink',
    red: 'bg-red text-ink',
    ink: 'bg-ink text-paper',
  }
  return (
    <span
      className={`label brut-sm inline-flex items-center gap-1.5 px-2.5 py-1.5 ${tones[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  )
}

export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`label inline-flex items-center border-2 border-current px-2 py-1 ${className}`}>{children}</span>
  )
}

/* ──────────────────────────────────────────────────── Count-up number */
export function Counter({ to, suffix = '', className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const [v, setV] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setV(to)
      return
    }
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (n) => setV(Math.round(n)) })
    return () => c.stop()
  }, [inView, to, reduce])

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {to}
        {suffix}
      </span>
      <span aria-hidden="true">
        {String(v).padStart(2, '0')}
        {suffix}
      </span>
    </span>
  )
}

/* ─────────────────────────────── Figure frame: header bar + caption bar */
export function Figure({
  label,
  meta,
  children,
  footer,
  className = '',
  tone = 'paper',
}: {
  label: string
  meta?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  tone?: 'paper' | 'ink'
}) {
  const dark = tone === 'ink'
  return (
    <figure className={`brut ${dark ? 'bg-ink text-paper' : 'bg-paper-2 text-ink'} ${className}`}>
      <div className={`label flex items-center justify-between gap-3 border-b-2 border-ink px-3 py-2 ${dark ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 bg-acid" />
          {label}
        </span>
        {meta && <span className="truncate opacity-80">{meta}</span>}
      </div>
      {children}
      {footer && <figcaption className="label border-t-2 border-ink px-3 py-2">{footer}</figcaption>}
    </figure>
  )
}
