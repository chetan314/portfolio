import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useRef } from 'react'
import { spotlightHandlers } from '../lib/spotlight'

export const EASE = [0.22, 1, 0.36, 1] as const

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function SpotlightCard({ className = '', children, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={`spotlight glass rounded-3xl ${className}`} {...spotlightHandlers} {...rest}>
      {children}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <Reveal className="mb-12 max-w-3xl md:mb-16">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl">{title}</h2>
      {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate md:text-lg">{intro}</p>}
    </Reveal>
  )
}

/** Wraps a single interactive child and pulls it toward the pointer. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  return (
    <motion.span
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
    </motion.span>
  )
}

type BtnProps = ComponentPropsWithoutRef<'a'> & { variant?: 'primary' | 'ghost' }

export function Button({ variant = 'primary', className = '', children, ...rest }: BtnProps) {
  const base =
    'group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-300'
  const styles =
    variant === 'primary'
      ? 'bg-ink text-void hover:bg-cyan hover:shadow-[0_0_40px_-6px_rgb(0_240_255/0.6)]'
      : 'border border-line bg-glass text-ink hover:border-cyan/50 hover:text-cyan'
  return (
    <Magnetic>
      <a className={`${base} ${styles} ${className}`} {...rest}>
        {children}
      </a>
    </Magnetic>
  )
}
