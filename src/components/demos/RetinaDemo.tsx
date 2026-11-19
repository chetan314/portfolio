import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { analyse, generateFundus, N, CENTER, FOV_RADIUS, type Analysis } from './retina'

const STAGES = [
  { key: 'raw', label: 'Raw', note: 'Synthetic fundus with uneven illumination and sensor noise.' },
  { key: 'pre', label: 'Pre-process', note: 'Green channel → 3×3 mean → background subtraction → contrast stretch.' },
  { key: 'morph', label: 'Morphology', note: 'Black-hat (closing − image) lifts dark vessels; top-hat lifts bright exudates.' },
  { key: 'seg', label: 'Segment', note: 'Thresholds + connected components: vessels, exudates, microaneurysm candidates.' },
  { key: 'feat', label: 'Features', note: 'Four sub-image partitions → per-quadrant features for the classifier.' },
] as const

export default function RetinaDemo() {
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const inView = useInView(host, { once: true, margin: '200px' })
  const [seed, setSeed] = useState(260)
  const [stage, setStage] = useState(3)
  const [a, setA] = useState<Analysis | null>(null)

  useEffect(() => {
    if (!inView) return
    // let the frame paint before crunching pixels
    const id = setTimeout(() => setA(analyse(generateFundus(seed))), 30)
    return () => clearTimeout(id)
  }, [seed, inView])

  useEffect(() => {
    const cv = canvas.current
    if (!cv || !a) return
    const g = cv.getContext('2d')!
    const s = STAGES[stage].key
    const img = s === 'raw' ? a.raw : s === 'pre' ? a.pre : s === 'morph' ? a.morph : a.seg
    g.putImageData(img, 0, 0)
    if (s === 'seg' || s === 'feat') {
      g.lineWidth = 1.5
      g.strokeStyle = '#ff4545'
      a.mas.forEach((m) => {
        g.beginPath()
        g.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        g.stroke()
      })
    }
    if (s === 'feat') {
      g.fillStyle = 'rgba(23,23,23,0.25)'
      g.fillRect(0, 0, N, N)
      g.strokeStyle = '#dfff00'
      g.lineWidth = 2
      g.setLineDash([5, 4])
      g.beginPath()
      g.moveTo(CENTER, CENTER - FOV_RADIUS)
      g.lineTo(CENTER, CENTER + FOV_RADIUS)
      g.moveTo(CENTER - FOV_RADIUS, CENTER)
      g.lineTo(CENTER + FOV_RADIUS, CENTER)
      g.stroke()
      g.setLineDash([])
      g.font = '700 11px "JetBrains Mono", monospace'
      g.fillStyle = '#dfff00'
      ;['Q2', 'Q1', 'Q4', 'Q3'].forEach((t, i) => {
        const x = i % 2 === 0 ? 28 : N - 48
        const y = i < 2 ? 30 : N - 20
        g.fillText(t, x, y)
      })
    }
  }, [a, stage])

  const total = a ? { ex: a.exudates.length, ma: a.mas.length } : { ex: 0, ma: 0 }

  return (
    <div ref={host} className="brut bg-paper-2 text-ink">
      <div className="label flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2 text-paper">
        <span>fundus_{String(seed).padStart(3, '0')}.png</span>
        <span className="text-acid">{a ? `${a.ms.toFixed(0)} ms in-browser` : 'computing…'}</span>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-5">
        <div className="relative aspect-square w-full border-2 border-ink bg-ink">
          <canvas
            ref={canvas}
            width={N}
            height={N}
            className="h-full w-full"
            role="img"
            aria-label={`Retinal fundus image, stage: ${STAGES[stage].label}. ${total.ex} exudate regions and ${total.ma} microaneurysm candidates detected.`}
          />
          {!a && <div className="label absolute inset-0 flex items-center justify-center text-paper">loading…</div>}
        </div>

        <div className="flex flex-col gap-3">
          <div role="tablist" aria-label="Pipeline stage" className="grid grid-cols-5 border-2 border-ink sm:grid-cols-1">
            {STAGES.map((s, i) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={stage === i}
                onClick={() => setStage(i)}
                className={`label flex items-center gap-2 border-ink px-2 py-2 text-left max-sm:justify-center max-sm:border-r-2 max-sm:last:border-r-0 sm:border-b-2 sm:last:border-b-0 ${
                  stage === i ? 'bg-orange' : 'bg-paper hover:bg-acid'
                }`}
              >
                <span className="text-muted max-sm:hidden">{String(i + 1).padStart(2, '0')}</span>
                <span className="max-sm:hidden">{s.label}</span>
                <span className="sm:hidden">{String(i + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <p className="min-h-[3.5em] text-[13px] leading-snug" aria-live="polite">
            <span className="font-semibold sm:hidden">{STAGES[stage].label}: </span>
            {STAGES[stage].note}
          </p>
          <button
            onClick={() => setSeed((s) => (s * 7 + 13) % 997)}
            data-cursor="NEW EYE"
            className="brut-sm brut-hover label mt-auto flex items-center justify-center gap-2 bg-acid px-3 py-2"
          >
            <Shuffle size={14} /> Generate new eye
          </button>
        </div>
      </div>

      <div className="border-t-2 border-ink p-4 md:p-5">
        <table className="w-full text-left font-mono text-[12px]">
          <caption className="label mb-2 text-left text-muted">Per-quadrant features</caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="py-1 font-medium">Q</th>
              <th className="py-1 font-medium">vessel %</th>
              <th className="py-1 font-medium">exudates</th>
              <th className="py-1 font-medium">MA</th>
            </tr>
          </thead>
          <tbody>
            {(a?.quadrants ?? []).map((q, i) => (
              <tr key={q.name} className="border-b border-line" title={q.name}>
                <td className="py-1">Q{i + 1}</td>
                <td className="py-1">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-2 bg-blue" style={{ width: `${Math.min(60, q.vessel * 6)}px` }} />
                    {q.vessel.toFixed(1)}
                  </span>
                </td>
                <td className="py-1">{q.exudates}</td>
                <td className="py-1">{q.mas}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="label flex flex-wrap gap-3">
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 bg-blue" /> vessels</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 border border-ink bg-acid" /> exudates</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full border-2 border-red" /> MA</span>
          </span>
          <span className="label bg-ink px-2 py-1 text-paper">toy grade → {a?.grade ?? '…'}</span>
        </div>
      </div>
    </div>
  )
}
