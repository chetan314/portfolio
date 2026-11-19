import { useEffect, useRef } from 'react'

type Node = { x: number; y: number; vx: number; vy: number; z: number }
type Pulse = { a: number; b: number; t: number; speed: number; hops: number }

const LINK = 150 // max link distance in CSS px
const MOUSE_R = 190

/**
 * Mouse-reactive neural field: drifting nodes, proximity links, and signal
 * pulses that hop node to node like activations. Pauses off-screen and draws
 * a single static frame under prefers-reduced-motion.
 */
export function NeuralCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let nodes: Node[] = []
    let pulses: Pulse[] = []
    const mouse = { x: -9999, y: -9999, active: false }
    let raf = 0
    let running = false
    let last = performance.now()

    const seed = () => {
      const count = Math.min(120, Math.max(36, Math.round((w * h) / 11000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        z: 0.35 + Math.random() * 0.65,
      }))
      pulses = []
    }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      if (!running) draw(0)
    }

    const neighbours = (i: number) => {
      const out: number[] = []
      const n = nodes[i]
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue
        const dx = nodes[j].x - n.x
        const dy = nodes[j].y - n.y
        if (dx * dx + dy * dy < LINK * LINK) out.push(j)
      }
      return out
    }

    const spawnPulse = (from?: number, hops = 0) => {
      const a = from ?? Math.floor(Math.random() * nodes.length)
      const nb = neighbours(a)
      if (!nb.length) return
      const b = nb[Math.floor(Math.random() * nb.length)]
      pulses.push({ a, b, t: 0, speed: 0.012 + Math.random() * 0.012, hops })
    }

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h)

      // integrate
      for (const n of nodes) {
        n.x += n.vx * dt * n.z
        n.y += n.vy * dt * n.z
        if (mouse.active) {
          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < MOUSE_R * MOUSE_R && d2 > 1) {
            const f = (1 - Math.sqrt(d2) / MOUSE_R) * 0.6 * n.z
            n.x += (dx / Math.sqrt(d2)) * f * dt * 0.06
            n.y += (dy / Math.sqrt(d2)) * f * dt * 0.06
          }
        }
        if (n.x < -20) n.x = w + 20
        if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20
        if (n.y > h + 20) n.y = -20
      }

      // links
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > LINK * LINK) continue
          const k = 1 - Math.sqrt(d2) / LINK
          let near = 0
          if (mouse.active) {
            const mx = (a.x + b.x) / 2 - mouse.x
            const my = (a.y + b.y) / 2 - mouse.y
            near = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / MOUSE_R)
          }
          const alpha = k * 0.16 * Math.min(a.z, b.z) + near * k * 0.45
          ctx.strokeStyle = near > 0.05 ? `rgba(0,240,255,${alpha})` : `rgba(140,110,255,${alpha})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // mouse links
      if (mouse.active) {
        for (const n of nodes) {
          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MOUSE_R) {
            ctx.strokeStyle = `rgba(0,240,255,${(1 - d / MOUSE_R) * 0.35})`
            ctx.beginPath()
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(n.x, n.y)
            ctx.stroke()
          }
        }
      }

      // nodes
      for (const n of nodes) {
        let glow = 0
        if (mouse.active) {
          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / MOUSE_R)
        }
        ctx.fillStyle = glow > 0.05 ? `rgba(0,240,255,${0.5 + glow * 0.5})` : `rgba(244,244,246,${0.25 + n.z * 0.35})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1 + n.z * 1.4 + glow * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // pulses
      if (!reduce) {
        if (pulses.length < 9 && Math.random() < 0.05) spawnPulse()
        const next: Pulse[] = []
        for (const p of pulses) {
          p.t += p.speed * dt * 0.06
          const a = nodes[p.a]
          const b = nodes[p.b]
          const x = a.x + (b.x - a.x) * p.t
          const y = a.y + (b.y - a.y) * p.t
          const g = ctx.createRadialGradient(x, y, 0, x, y, 10)
          g.addColorStop(0, 'rgba(0,240,255,0.95)')
          g.addColorStop(1, 'rgba(0,240,255,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, Math.PI * 2)
          ctx.fill()
          if (p.t >= 1) {
            if (p.hops < 4 && Math.random() < 0.75) spawnPulseInto(next, p.b, p.hops + 1)
          } else next.push(p)
        }
        pulses = next
      }
    }

    const spawnPulseInto = (list: Pulse[], from: number, hops: number) => {
      const nb = neighbours(from)
      if (!nb.length) return
      const b = nb[Math.floor(Math.random() * nb.length)]
      list.push({ a: from, b, t: 0, speed: 0.012 + Math.random() * 0.012, hops })
    }

    const loop = (now: number) => {
      const dt = Math.min(now - last, 48) // ms, clamped after tab switches
      last = now
      draw(dt)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running || reduce) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.active = mouse.y >= 0 && mouse.y <= r.height
    }
    const onLeave = () => (mouse.active = false)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
    io.observe(canvas)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />
}
