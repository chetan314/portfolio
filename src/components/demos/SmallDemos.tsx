import { motion, useReducedMotion } from 'framer-motion'

/** Illustrative phase-recognition timeline with a scanning playhead. */
export function SurgicalDemo() {
  const reduce = useReducedMotion()
  const phases = [
    { name: 'Prep', w: 12, c: '#3b3f4d' },
    { name: 'Dissection', w: 30, c: '#7c3aed' },
    { name: 'Clip & cut', w: 14, c: '#00f0ff' },
    { name: 'Resection', w: 26, c: '#a78bfa' },
    { name: 'Closing', w: 18, c: '#475569' },
  ]
  return (
    <div className="font-mono text-[10.5px] text-slate">
      <div className="mb-2 flex justify-between">
        <span>phase_recognition(video)</span>
        <span className="text-slate/60">illustrative</span>
      </div>
      <div className="relative overflow-x-clip">
        <div className="flex h-7 overflow-hidden rounded-md ring-1 ring-line">
          {phases.map((p) => (
            <div key={p.name} style={{ width: `${p.w}%`, background: p.c }} className="opacity-70" />
          ))}
        </div>
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ x: '0%' }}
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 7, ease: 'linear', repeat: Infinity }}
          >
            <div className="absolute -top-1 -bottom-1 left-0 w-0.5 rounded bg-ink shadow-[0_0_12px_2px_rgb(0_240_255/0.7)]" />
          </motion.div>
        )}
      </div>
      <div className="mt-2 flex">
        {phases.map((p) => (
          <span key={p.name} style={{ width: `${p.w}%` }} className="truncate pr-1">
            {p.name}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {['tool detection', 'phase recognition', 'SAM masks', 'domain shift'].map((t) => (
          <div key={t} className="rounded-lg border border-line bg-white/[0.02] px-2.5 py-2 text-ink/80">
            <span className="text-cyan">›</span> {t}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Animated data pipeline: scrape → clean → SQL → extract → model. */
export function PipelineDemo() {
  const steps = ['scrape', 'clean', 'SQL QA', 'extract', 'model']
  const x = (i: number) => 30 + i * 135
  return (
    <svg viewBox="0 0 600 110" className="h-auto w-full" role="img" aria-label="Data pipeline from scraping to model">
      <defs>
        <linearGradient id="pl" x1="0" x2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#00f0ff" />
        </linearGradient>
      </defs>
      <line x1={x(0)} y1="45" x2={x(4)} y2="45" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <line x1={x(0)} y1="45" x2={x(4)} y2="45" stroke="url(#pl)" strokeWidth="2" className="flow-line" />
      {steps.map((s, i) => (
        <g key={s}>
          <circle cx={x(i)} cy="45" r="13" fill="#0b0d12" stroke={i === 4 ? '#00f0ff' : 'rgba(255,255,255,0.18)'} />
          <circle cx={x(i)} cy="45" r="4" fill={i === 4 ? '#00f0ff' : '#a78bfa'} />
          <text x={x(i)} y="86" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#8e92a4">
            {s}
          </text>
        </g>
      ))}
      <text x={x(1)} y="18" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#00f0ff">
        −40% manual
      </text>
      <text x={x(2)} y="18" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#00f0ff">
        −50% manual
      </text>
      <text x={x(4)} y="18" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#00f0ff">
        92% acc
      </text>
    </svg>
  )
}
