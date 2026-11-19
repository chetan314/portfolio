import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const STAGES = ['Fundus', 'Pre-process', 'Vessels', 'Lesions', 'Partitions'] as const

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Seg = { x1: number; y1: number; x2: number; y2: number; w: number }
type Dot = { x: number; y: number; r: number }

// Geometry in unit space (0..1), generated once.
function buildScene() {
  const r = rng(7)
  const segs: Seg[] = []
  const disc = { x: 0.66, y: 0.48 }
  const grow = (x: number, y: number, ang: number, len: number, w: number, depth: number) => {
    if (depth > 6 || w < 0.0025) return
    let cx = x
    let cy = y
    let a = ang
    const steps = 6
    for (let i = 0; i < steps; i++) {
      a += (r() - 0.5) * 0.35
      const nx = cx + Math.cos(a) * (len / steps)
      const ny = cy + Math.sin(a) * (len / steps)
      segs.push({ x1: cx, y1: cy, x2: nx, y2: ny, w })
      cx = nx
      cy = ny
    }
    const spread = 0.35 + r() * 0.35
    grow(cx, cy, a - spread, len * 0.78, w * 0.7, depth + 1)
    grow(cx, cy, a + spread, len * 0.72, w * 0.66, depth + 1)
  }
  // Four main arcades leaving the optic disc
  ;[-2.5, 2.5, -1.9, 1.9, Math.PI].forEach((a, i) => grow(disc.x, disc.y, a, i < 2 ? 0.2 : 0.14, 0.014, 0))

  const inside = (x: number, y: number) => (x - 0.5) ** 2 + (y - 0.5) ** 2 < 0.44 ** 2
  const exudates: Dot[] = []
  for (let c = 0; c < 3; c++) {
    const cx = 0.3 + r() * 0.3
    const cy = 0.3 + r() * 0.4
    for (let i = 0; i < 7; i++) {
      const x = cx + (r() - 0.5) * 0.12
      const y = cy + (r() - 0.5) * 0.1
      if (inside(x, y)) exudates.push({ x, y, r: 0.006 + r() * 0.01 })
    }
  }
  const mas: Dot[] = []
  for (let i = 0; i < 14; i++) {
    const x = 0.15 + r() * 0.7
    const y = 0.15 + r() * 0.7
    if (inside(x, y) && Math.hypot(x - disc.x, y - disc.y) > 0.1) mas.push({ x, y, r: 0.004 + r() * 0.003 })
  }
  return { segs, disc, exudates, mas }
}

const SCENE = buildScene()

function quadrantStats() {
  const q = [0, 0, 0, 0].map(() => ({ vessel: 0, ex: 0, ma: 0 }))
  const idx = (x: number, y: number) => (y < 0.5 ? 0 : 2) + (x < 0.5 ? 0 : 1)
  SCENE.segs.forEach((s) => (q[idx(s.x1, s.y1)].vessel += Math.hypot(s.x2 - s.x1, s.y2 - s.y1) * s.w))
  SCENE.exudates.forEach((d) => q[idx(d.x, d.y)].ex++)
  SCENE.mas.forEach((d) => q[idx(d.x, d.y)].ma++)
  const maxV = Math.max(...q.map((v) => v.vessel))
  return q.map((v) => ({ ...v, vessel: v.vessel / maxV }))
}
const QUADS = quadrantStats()

function renderStage(stage: number, size: number, dpr: number) {
  const c = document.createElement('canvas')
  c.width = c.height = Math.round(size * dpr)
  const g = c.getContext('2d')!
  g.scale(dpr * size, dpr * size) // draw in unit space
  const lw = 1 / size

  g.save()
  g.beginPath()
  g.arc(0.5, 0.5, 0.46, 0, Math.PI * 2)
  g.clip()

  const vessels = (color: string, scale = 1) => {
    g.strokeStyle = color
    g.lineCap = 'round'
    SCENE.segs.forEach((s) => {
      g.lineWidth = s.w * scale
      g.beginPath()
      g.moveTo(s.x1, s.y1)
      g.lineTo(s.x2, s.y2)
      g.stroke()
    })
  }
  const dots = (list: Dot[], color: string, k = 1) => {
    g.fillStyle = color
    list.forEach((d) => {
      g.beginPath()
      g.arc(d.x, d.y, d.r * k, 0, Math.PI * 2)
      g.fill()
    })
  }

  if (stage === 0) {
    const bg = g.createRadialGradient(0.55, 0.45, 0.05, 0.5, 0.5, 0.5)
    bg.addColorStop(0, '#e2733a')
    bg.addColorStop(0.6, '#b6401f')
    bg.addColorStop(1, '#3a0d06')
    g.fillStyle = bg
    g.fillRect(0, 0, 1, 1)
    // uneven illumination
    const ill = g.createLinearGradient(0, 0, 1, 1)
    ill.addColorStop(0, 'rgba(255,220,180,0.18)')
    ill.addColorStop(1, 'rgba(0,0,0,0.35)')
    g.fillStyle = ill
    g.fillRect(0, 0, 1, 1)
    const disc = g.createRadialGradient(SCENE.disc.x, SCENE.disc.y, 0, SCENE.disc.x, SCENE.disc.y, 0.08)
    disc.addColorStop(0, 'rgba(255,240,190,1)')
    disc.addColorStop(1, 'rgba(255,200,120,0)')
    g.fillStyle = disc
    g.fillRect(0, 0, 1, 1)
    vessels('rgba(110,15,10,0.85)')
    dots(SCENE.exudates, 'rgba(250,225,120,0.95)')
    dots(SCENE.mas, 'rgba(90,5,5,0.95)')
  } else if (stage === 1) {
    g.fillStyle = '#4a4d57'
    g.fillRect(0, 0, 1, 1)
    const disc = g.createRadialGradient(SCENE.disc.x, SCENE.disc.y, 0, SCENE.disc.x, SCENE.disc.y, 0.07)
    disc.addColorStop(0, 'rgba(235,235,240,0.9)')
    disc.addColorStop(1, 'rgba(235,235,240,0)')
    g.fillStyle = disc
    g.fillRect(0, 0, 1, 1)
    vessels('#15161b')
    dots(SCENE.exudates, '#f2f3f7')
    dots(SCENE.mas, '#0b0c10')
  } else if (stage === 2) {
    g.fillStyle = '#050507'
    g.fillRect(0, 0, 1, 1)
    vessels('#f4f4f6', 0.9)
  } else {
    g.fillStyle = '#16171d'
    g.fillRect(0, 0, 1, 1)
    vessels('rgba(244,244,246,0.12)')
    dots(SCENE.exudates, 'rgba(0,240,255,0.95)', 0.9)
    dots(SCENE.mas, 'rgba(167,139,250,1)', 1.1)
    g.lineWidth = lw * 1.2
    g.strokeStyle = 'rgba(0,240,255,0.6)'
    SCENE.exudates.forEach((d) => {
      g.beginPath()
      g.arc(d.x, d.y, d.r + 0.012, 0, Math.PI * 2)
      g.stroke()
    })
    g.strokeStyle = 'rgba(167,139,250,0.8)'
    SCENE.mas.forEach((d) => {
      g.strokeRect(d.x - 0.016, d.y - 0.016, 0.032, 0.032)
    })
  }
  g.restore()

  // rim
  g.lineWidth = lw
  g.strokeStyle = 'rgba(255,255,255,0.12)'
  g.beginPath()
  g.arc(0.5, 0.5, 0.46, 0, Math.PI * 2)
  g.stroke()

  if (stage === 4) {
    g.strokeStyle = 'rgba(0,240,255,0.55)'
    g.setLineDash([lw * 4, lw * 4])
    g.beginPath()
    g.moveTo(0.5, 0.02)
    g.lineTo(0.5, 0.98)
    g.moveTo(0.02, 0.5)
    g.lineTo(0.98, 0.5)
    g.stroke()
  }
  return c
}

export function RetinaDemo() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const frames = useRef<HTMLCanvasElement[]>([])
  const [stage, setStage] = useState(0)
  const [auto, setAuto] = useState(true)
  const [inView, setInView] = useState(false)
  const prev = useRef(0)
  const reduce = useReducedMotion()

  // Build frames on resize
  useEffect(() => {
    const el = wrap.current!
    const draw = () => {
      const size = el.clientWidth
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      frames.current = STAGES.map((_, i) => renderStage(i, size, dpr))
      const c = canvas.current!
      c.width = c.height = Math.round(size * dpr)
      c.getContext('2d')!.drawImage(frames.current[prev.current], 0, 0)
    }
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  // Crossfade between stages
  useEffect(() => {
    const c = canvas.current
    const f = frames.current
    if (!c || !f.length) return
    const g = c.getContext('2d')!
    const from = f[prev.current]
    const to = f[stage]
    prev.current = stage
    if (reduce) {
      g.clearRect(0, 0, c.width, c.height)
      g.drawImage(to, 0, 0)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 550)
      const e = 1 - Math.pow(1 - t, 3)
      g.clearRect(0, 0, c.width, c.height)
      g.globalAlpha = 1
      g.drawImage(from, 0, 0)
      g.globalAlpha = e
      g.drawImage(to, 0, 0)
      g.globalAlpha = 1
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [stage, reduce])

  // Auto-advance while visible
  useEffect(() => {
    if (!auto || !inView || reduce) return
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2200)
    return () => clearInterval(t)
  }, [auto, inView, reduce])

  return (
    <div className="flex h-full flex-col">
      <div ref={wrap} className="relative mx-auto aspect-square w-full max-w-[340px]">
        <canvas ref={canvas} className="h-full w-full" role="img" aria-label={`Synthetic retinal image, ${STAGES[stage]} stage`} />
        {stage === 4 && (
          <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 p-[6%] font-mono text-[10px] text-ink">
            {QUADS.map((q, i) => (
              <div key={i} className={`flex flex-col gap-0.5 p-2 ${i % 2 ? 'items-end text-right' : ''} ${i > 1 ? 'justify-end' : ''}`}>
                <span className="rounded bg-void/70 px-1.5 py-0.5">
                  Q{i + 1} vsl {q.vessel.toFixed(2)}
                </span>
                <span className="rounded bg-void/70 px-1.5 py-0.5 text-cyan">ex {q.ex}</span>
                <span className="rounded bg-void/70 px-1.5 py-0.5 text-violet-300">ma {q.ma}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div role="tablist" aria-label="Pipeline stage" className="mt-4 flex flex-wrap justify-center gap-1.5">
        {STAGES.map((s, i) => (
          <button
            key={s}
            role="tab"
            aria-selected={stage === i}
            onClick={() => {
              setAuto(false)
              setStage(i)
            }}
            className={`rounded-full border px-2.5 py-1 font-mono text-[10.5px] transition-colors ${
              stage === i ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-line text-slate hover:text-ink'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>
    </div>
  )
}
