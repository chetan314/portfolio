import { useEffect, useRef } from 'react'

const CORPUS =
  'retrieval augmented generation bm25 dense embeddings segment anything domain adaptation fundus vessels exudates microaneurysms surgical phase recognition tool tracking attention query key value softmax tokens sql pipelines anomaly detection fastapi docker python pandas numpy morphology top hat segmentation features classifier '

type Readout = { x: number; y: number; token: string; weight: number }

/**
 * A grid of tokens. The pointer is the query vector; each cell's weight is a
 * gaussian of its distance to the query, perturbed by a per-cell "key".
 * Weights are quantised into the brand's colour blocks.
 */
export default function AttentionCanvas({ onReadout }: { onReadout?: (r: Readout) => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const readoutRef = useRef(onReadout)
  readoutRef.current = onReadout

  useEffect(() => {
    const el = canvas.current!
    const host = wrap.current!
    const ctx = el.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = 0
    let H = 0
    let cell = 22
    let cols = 0
    let rows = 0
    let chars: string[] = []
    let words: number[] = []
    let keys: Float32Array = new Float32Array(0)
    const wordList = CORPUS.trim().split(' ')

    // query state (in px), target, and whether the pointer is driving it
    let qx = 0
    let qy = 0
    let tx = 0
    let ty = 0
    let pointerActive = false
    let lastPointer = 0
    let running = false
    let visible = true
    let raf = 0
    let t0 = performance.now()

    const css = getComputedStyle(document.documentElement)
    const C = {
      ink: css.getPropertyValue('--color-ink').trim() || '#171717',
      paper: css.getPropertyValue('--color-paper-2').trim() || '#faf9f6',
      blue: css.getPropertyValue('--color-blue').trim() || '#2457ff',
      acid: css.getPropertyValue('--color-acid').trim() || '#dfff00',
      faint: '#b9b4a8',
    }

    const layout = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width
      H = r.height
      el.width = Math.round(W * dpr)
      el.height = Math.round(H * dpr)
      el.style.width = `${W}px`
      el.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = W < 520 ? 18 : 22
      cols = Math.ceil(W / cell)
      rows = Math.ceil(H / cell)
      chars = []
      words = []
      let wi = 0
      let ci = 0
      for (let i = 0; i < cols * rows; i++) {
        const w = wordList[wi % wordList.length]
        if (ci >= w.length) {
          chars.push('·')
          words.push(-1)
          wi++
          ci = 0
        } else {
          chars.push(w[ci])
          words.push(wi % wordList.length)
          ci++
        }
      }
      keys = new Float32Array(cols * rows)
      let s = 1337
      for (let i = 0; i < keys.length; i++) {
        s = (s * 16807) % 2147483647
        keys[i] = 0.55 + ((s % 1000) / 1000) * 0.45
      }
      if (!qx && !qy) {
        qx = tx = W * 0.62
        qy = ty = H * 0.45
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.font = `500 ${cell < 20 ? 9 : 10}px "JetBrains Mono", ui-monospace, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const sigma = cell * 4.2
      const inv = 1 / (2 * sigma * sigma)
      let best = -1
      let bestW = 0
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c
          const cx = c * cell + cell / 2
          const cy = r * cell + cell / 2
          const dx = cx - qx
          const dy = cy - qy
          const w = Math.exp(-(dx * dx + dy * dy) * inv) * keys[i]
          if (w > bestW && words[i] >= 0) {
            bestW = w
            best = i
          }
          const x = c * cell
          const y = r * cell
          if (w > 0.72) {
            ctx.fillStyle = C.acid
            ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2)
            ctx.strokeStyle = C.ink
            ctx.lineWidth = 1.5
            ctx.strokeRect(x + 1.5, y + 1.5, cell - 3, cell - 3)
            ctx.fillStyle = C.ink
          } else if (w > 0.48) {
            ctx.fillStyle = C.blue
            ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2)
            ctx.fillStyle = C.paper
          } else if (w > 0.28) {
            ctx.strokeStyle = C.blue
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(x + 3, y + cell - 3)
            ctx.lineTo(x + cell - 3, y + 3)
            ctx.stroke()
            ctx.fillStyle = C.ink
          } else if (w > 0.13) {
            ctx.strokeStyle = C.ink
            ctx.lineWidth = 1
            ctx.strokeRect(x + 3.5, y + 3.5, cell - 7, cell - 7)
            ctx.fillStyle = C.ink
          } else {
            ctx.fillStyle = C.faint
          }
          if (w <= 0.28 || w > 0.48) ctx.fillText(chars[i], x + cell / 2, y + cell / 2 + 0.5)
        }
      }
      // crosshair at the query
      ctx.strokeStyle = C.ink
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(qx, 0)
      ctx.lineTo(qx, H)
      ctx.moveTo(0, qy)
      ctx.lineTo(W, qy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.ink
      ctx.fillRect(qx - 4, qy - 4, 8, 8)

      readoutRef.current?.({
        x: qx / W,
        y: qy / H,
        token: best >= 0 ? wordList[words[best]] : '',
        weight: bestW,
      })
    }

    const tick = (t: number) => {
      if (!pointerActive || t - lastPointer > 2500) {
        pointerActive = false
        const s = (t - t0) / 1000
        tx = W * (0.5 + 0.34 * Math.sin(s * 0.45))
        ty = H * (0.5 + 0.32 * Math.sin(s * 0.71 + 1.2))
      }
      const nx = qx + (tx - qx) * 0.12
      const ny = qy + (ty - qy) * 0.12
      const moved = Math.abs(nx - qx) + Math.abs(ny - qy) > 0.15
      qx = nx
      qy = ny
      if (moved) draw()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running || reduce || !visible || document.hidden) return
      running = true
      t0 = performance.now() - 4000
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      pointerActive = true
      lastPointer = performance.now()
    }

    layout()
    draw()
    // fonts may arrive after first paint
    document.fonts?.ready.then(() => draw())

    const ro = new ResizeObserver(() => {
      layout()
      draw()
    })
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(host)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    host.addEventListener('pointermove', onMove)
    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      host.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0 touch-pan-y" data-cursor="QUERY">
      <canvas
        ref={canvas}
        role="img"
        aria-label="Interactive attention map: a grid of machine-learning terms that highlights around your pointer like an attention heatmap."
      />
    </div>
  )
}
