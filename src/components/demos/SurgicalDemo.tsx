import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'

// Phase + tool schema follows the public Cholec80 benchmark (laparoscopic
// cholecystectomy). The scene is an abstract illustration, not real video.
const PHASES = [
  { name: 'Preparation', dur: 0.08, tools: ['grasper'] },
  { name: 'Calot triangle dissection', dur: 0.28, tools: ['grasper', 'hook'] },
  { name: 'Clipping & cutting', dur: 0.12, tools: ['grasper', 'clipper', 'scissors'] },
  { name: 'Gallbladder dissection', dur: 0.2, tools: ['grasper', 'hook'] },
  { name: 'Gallbladder packaging', dur: 0.1, tools: ['grasper', 'bag'] },
  { name: 'Cleaning & coagulation', dur: 0.14, tools: ['irrigator', 'bipolar'] },
  { name: 'Gallbladder retraction', dur: 0.08, tools: ['grasper', 'bag'] },
] as const

type ToolId = 'grasper' | 'hook' | 'clipper' | 'scissors' | 'bag' | 'irrigator' | 'bipolar'

const W = 400
const H = 240
const LOOP_S = 26

const starts = PHASES.reduce<number[]>((acc, _p, i) => [...acc, i === 0 ? 0 : acc[i - 1] + PHASES[i - 1].dur], [])

function phaseAt(t: number) {
  for (let i = PHASES.length - 1; i >= 0; i--) if (t >= starts[i]) return i
  return 0
}

const TOOL_DEF: Record<ToolId, { base: [number, number]; tip: (s: number) => [number, number] }> = {
  grasper: { base: [-40, 40], tip: (s) => [168 + Math.sin(s * 1.3) * 14, 92 + Math.cos(s * 0.9) * 10] },
  hook: { base: [W + 40, 30], tip: (s) => [226 + Math.sin(s * 2.1) * 18, 128 + Math.sin(s * 1.6) * 14] },
  clipper: { base: [W + 40, 70], tip: (s) => [214 + Math.sin(s * 1.2) * 8, 140 + Math.cos(s * 1.4) * 6] },
  scissors: { base: [W + 30, H + 20], tip: (s) => [222 + Math.sin(s * 1.5) * 10, 150 + Math.cos(s) * 6] },
  irrigator: { base: [W + 40, H - 10], tip: (s) => [250 + Math.sin(s * 0.9) * 30, 170 + Math.cos(s * 1.1) * 12] },
  bipolar: { base: [-30, H + 10], tip: (s) => [150 + Math.sin(s * 1.7) * 22, 168 + Math.cos(s * 1.3) * 10] },
  bag: { base: [0, 0], tip: (s) => [118 + Math.sin(s * 0.6) * 6, 150 + Math.cos(s * 0.8) * 4] },
}

function Tool({ id, s, masked, onToggle }: { id: ToolId; s: number; masked: boolean; onToggle: () => void }) {
  const [tx, ty] = TOOL_DEF[id].tip(s)
  const conf = 0.86 + ((Math.sin(s * 3 + id.length) + 1) / 2) * 0.12
  const bbox = id === 'bag' ? { x: tx - 34, y: ty - 26, w: 68, h: 52 } : { x: tx - 26, y: ty - 22, w: 52, h: 44 }

  let body: ReactNode
  if (id === 'bag') {
    body = (
      <g>
        <path
          d={`M${tx - 26} ${ty - 14} q 26 -18 52 0 l -6 30 q -20 12 -40 0 z`}
          fill={masked ? '#dfff00' : '#faf9f6'}
          stroke="#171717"
          strokeWidth="2.5"
        />
        <path d={`M${tx - 18} ${ty - 2} h36`} stroke="#171717" strokeWidth="1.5" strokeDasharray="3 3" />
      </g>
    )
  } else {
    const [bx, by] = TOOL_DEF[id].base
    const a = Math.atan2(ty - by, tx - bx)
    const deg = (a * 180) / Math.PI
    const jaw = 3 + Math.abs(Math.sin(s * 4)) * 6
    const tip: Record<Exclude<ToolId, 'bag'>, ReactNode> = {
      grasper: (
        <g>
          <path d={`M0 0 l16 ${-jaw}`} strokeWidth="4" />
          <path d={`M0 0 l16 ${jaw}`} strokeWidth="4" />
        </g>
      ),
      hook: <path d="M0 0 h14 v-8" strokeWidth="3.5" fill="none" />,
      clipper: (
        <g>
          <path d={`M0 -3 h16 l2 ${-jaw / 2}`} strokeWidth="5" />
          <path d={`M0 3 h16 l2 ${jaw / 2}`} strokeWidth="5" />
        </g>
      ),
      scissors: (
        <g>
          <path d={`M0 0 L18 ${-jaw * 0.7}`} strokeWidth="2.5" />
          <path d={`M0 0 L18 ${jaw * 0.7}`} strokeWidth="2.5" />
        </g>
      ),
      irrigator: <path d="M0 0 h10" strokeWidth="9" />,
      bipolar: (
        <g>
          <path d="M0 -3 h14" strokeWidth="2.5" />
          <path d="M0 3 h14" strokeWidth="2.5" />
        </g>
      ),
    }
    body = (
      <g>
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={masked ? '#dfff00' : '#171717'} strokeWidth={masked ? 15 : 11} />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={masked ? '#171717' : '#9a978f'} strokeWidth="3" />
        <g transform={`translate(${tx} ${ty}) rotate(${deg})`} stroke={masked ? '#dfff00' : '#171717'} strokeLinecap="square">
          {tip[id as Exclude<ToolId, 'bag'>]}
        </g>
      </g>
    )
  }

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${id}, confidence ${conf.toFixed(2)}. ${masked ? 'Hide' : 'Show'} segmentation mask`}
      aria-pressed={masked}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
      className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[4]"
      data-cursor={masked ? 'UNMASK' : 'SAM ⊕'}
    >
      {body}
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill="none" stroke="#2457ff" strokeWidth="2" />
      <rect x={bbox.x - 1} y={bbox.y - 13} width={id.length * 6.2 + 34} height="13" fill="#2457ff" />
      <text x={bbox.x + 3} y={bbox.y - 3.5} fill="#faf9f6" fontSize="9" fontFamily="JetBrains Mono, monospace">
        {id} {conf.toFixed(2)}
      </text>
      {masked && <circle cx={tx} cy={ty} r="3.5" fill="#ff4545" stroke="#171717" strokeWidth="1.5" />}
    </g>
  )
}

export default function SurgicalDemo() {
  const host = useRef<HTMLDivElement>(null)
  const inView = useInView(host, { margin: '100px' })
  const reduce = useReducedMotion()
  const [t, setT] = useState(0.18)
  const [playing, setPlaying] = useState(!reduce)
  const [masks, setMasks] = useState<Set<ToolId>>(() => new Set(['hook']))

  useEffect(() => {
    if (!playing || !inView) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setT((v) => (v + dt / LOOP_S) % 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView])

  const p = phaseAt(t)
  const s = t * LOOP_S
  const tools = useMemo(() => {
    const ph = PHASES[p]
    // clipping phase: clipper first, scissors second
    if (ph.name.startsWith('Clipping')) {
      const local = (t - starts[p]) / ph.dur
      return (local < 0.55 ? ['grasper', 'clipper'] : ['grasper', 'scissors']) as ToolId[]
    }
    return [...ph.tools] as ToolId[]
  }, [p, t])

  const toggle = (id: ToolId) =>
    setMasks((m) => {
      const n = new Set(m)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const secs = Math.floor(t * 62 * 60)
  const tc = `${String(Math.floor(secs / 3600)).padStart(2, '0')}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  return (
    <div ref={host} className="brut bg-paper-2 text-ink">
      <div className="label flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2 text-paper">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red" /> lap_chole_042 · {tc}
        </span>
        <span className="text-acid">phase {p + 1}/7</span>
      </div>

      <div className="relative border-b-2 border-ink">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full bg-[#2a0f0a]" aria-label="Illustrative laparoscopic scene with detected tools">
          <defs>
            <pattern id="tissue" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <rect width="8" height="8" fill="#ff6b35" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#e85a28" strokeWidth="3" />
            </pattern>
            <radialGradient id="scope" cx="50%" cy="50%" r="62%">
              <stop offset="70%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
            </radialGradient>
          </defs>
          {/* liver */}
          <path d="M-10 0 H420 V70 Q300 110 200 72 Q110 40 -10 90 Z" fill="#a3261a" />
          <path d="M-10 0 H420 V40 Q300 74 200 46 Q110 20 -10 60 Z" fill="#7e1b12" />
          {/* gallbladder */}
          <ellipse cx="196" cy="118" rx="64" ry="34" fill="url(#tissue)" stroke="#171717" strokeWidth="2.5" />
          {/* cystic duct + artery (Calot's triangle) */}
          <path d="M240 132 Q270 160 312 166" stroke="#dfff00" strokeWidth="5" fill="none" />
          <path d="M236 142 Q262 182 300 196" stroke="#ff4545" strokeWidth="4" fill="none" />
          {/* omentum */}
          <path d="M-10 200 Q100 170 200 210 T420 196 V250 H-10 Z" fill="#e8b46a" />
          {tools.map((id) => (
            <Tool key={id} id={id} s={s} masked={masks.has(id)} onToggle={() => toggle(id)} />
          ))}
          <rect width={W} height={H} fill="url(#scope)" pointerEvents="none" />
        </svg>
        <span className="label absolute bottom-2 left-2 bg-acid px-1.5 py-0.5 text-[10px]">click a tool → SAM point-prompt mask</span>
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div aria-live="polite">
            <span className="label text-muted">Phase {p + 1} of 7</span>
            <p className="display mt-1 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-none">{PHASES[p].name}</p>
          </div>
          <button
            onClick={() => setPlaying((v) => !v)}
            className="brut-sm flex h-10 w-10 shrink-0 items-center justify-center bg-acid"
            aria-label={playing ? 'Pause' : 'Play'}
            data-cursor={playing ? 'PAUSE' : 'PLAY'}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>

        <div className="relative mt-4">
          <div className="flex h-7 border-2 border-ink" aria-hidden="true">
            {PHASES.map((ph, i) => (
              <div
                key={ph.name}
                style={{ width: `${ph.dur * 100}%` }}
                className={`label flex items-center justify-center border-r-2 border-ink text-[9px] last:border-r-0 ${
                  i === p ? 'bg-blue text-paper' : i % 2 ? 'bg-paper' : 'bg-line'
                }`}
              >
                P{i + 1}
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 -top-1 w-[3px] bg-red"
            style={{ left: `calc(${t * 100}% - 1px)` }}
          />
          <input
            type="range"
            min={0}
            max={0.999}
            step={0.001}
            value={t}
            onChange={(e) => {
              setT(Number(e.target.value))
              setPlaying(false)
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Scrub through the procedure"
            aria-valuetext={`Phase ${p + 1}: ${PHASES[p].name}`}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Tools present in this frame">
          {(['grasper', 'hook', 'clipper', 'scissors', 'bipolar', 'irrigator', 'bag'] as ToolId[]).map((id) => (
            <span
              key={id}
              className={`label border border-ink px-1.5 py-0.5 normal-case tracking-normal ${
                tools.includes(id) ? 'bg-ink text-paper' : 'text-muted'
              }`}
            >
              {id}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
