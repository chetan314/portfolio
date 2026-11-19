import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, RotateCcw, StepForward } from 'lucide-react'
import { EASE } from '../../lib/motion'

type Row = { id: number; company: string; date: string; revenue: string; flag?: string }

const RAW: Row[] = [
  { id: 1, company: '  acme textiles pvt ltd ', date: '12/03/2022', revenue: '₹ 1,20,000' },
  { id: 2, company: 'ACME TEXTILES PVT LTD', date: '2022-03-12', revenue: '120000' },
  { id: 3, company: 'Bharat Steelworks', date: 'Mar 15 2022', revenue: 'Rs. 4.5 lakh' },
  { id: 4, company: 'bharat steelworks ', date: '15-03-2022', revenue: '450000' },
  { id: 5, company: 'Coastal Agro', date: '2022/03/18', revenue: 'N/A' },
  { id: 6, company: 'Deccan Pharma', date: '18.03.2022', revenue: '₹98,00,000' },
  { id: 7, company: 'everest logistics', date: '21 Mar 2022', revenue: '3,10,500' },
  { id: 8, company: 'Fintech Labs ', date: '2022-03-22', revenue: 'INR 2,75,000' },
]

const MONTHS: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }

function isoDate(s: string) {
  const t = s.trim()
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/) // Indian DD/MM/YYYY
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  m = t.match(/^([a-z]{3})\w*\s+(\d{1,2}),?\s+(\d{4})$/i)
  if (m) return `${m[3]}-${MONTHS[m[1].toLowerCase()]}-${m[2].padStart(2, '0')}`
  m = t.match(/^(\d{1,2})\s+([a-z]{3})\w*\s+(\d{4})$/i)
  if (m) return `${m[3]}-${MONTHS[m[2].toLowerCase()]}-${m[1].padStart(2, '0')}`
  return t
}

function parseInr(s: string): string {
  const t = s.toLowerCase().replace(/₹|rs\.?|inr/g, '').trim()
  if (!t || t === 'n/a' || t === 'na' || t === '-') return ''
  const lakh = t.match(/([\d.]+)\s*lakh/)
  if (lakh) return String(Math.round(parseFloat(lakh[1]) * 100000))
  const crore = t.match(/([\d.]+)\s*(cr|crore)/)
  if (crore) return String(Math.round(parseFloat(crore[1]) * 10000000))
  return String(parseInt(t.replace(/[,\s]/g, ''), 10))
}

const titleCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bPvt\b/, 'Pvt')

const STEPS: { label: string; code: string; run: (rows: Row[]) => Row[] }[] = [
  { label: 'Normalise names', code: "df.company.str.strip().str.title()", run: (r) => r.map((x) => ({ ...x, company: titleCase(x.company) })) },
  { label: 'Parse dates → ISO', code: "pd.to_datetime(df.date, dayfirst=True)", run: (r) => r.map((x) => ({ ...x, date: isoDate(x.date) })) },
  { label: 'Coerce currency → ₹ int', code: 'df.revenue.map(parse_inr)  # lakh, ₹, Rs.', run: (r) => r.map((x) => ({ ...x, revenue: parseInr(x.revenue) })) },
  {
    label: 'De-duplicate',
    code: "df.drop_duplicates(['company', 'date'])",
    run: (r) => {
      const seen = new Set<string>()
      return r.filter((x) => {
        const k = `${x.company}|${x.date}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    },
  },
  {
    label: 'Flag anomalies',
    code: 'robust_z = 0.6745 * (x - median) / MAD',
    run: (r) => {
      const vals = r.map((x) => Number(x.revenue)).filter((v) => v > 0).sort((a, b) => a - b)
      const med = vals[Math.floor(vals.length / 2)]
      const mad = [...vals.map((v) => Math.abs(v - med))].sort((a, b) => a - b)[Math.floor(vals.length / 2)] || 1
      return r.map((x) => {
        if (!x.revenue) return { ...x, flag: 'missing' }
        const z = (0.6745 * (Number(x.revenue) - med)) / mad
        return Math.abs(z) > 3.5 ? { ...x, flag: `z=${z.toFixed(1)}` } : x
      })
    },
  },
]

const fmtInr = (s: string) => (s && /^\d+$/.test(s) ? '₹' + Number(s).toLocaleString('en-IN') : s)

export default function PipelineDemo() {
  const [step, setStep] = useState(0)

  const stages = useMemo(() => {
    const out: Row[][] = [RAW]
    STEPS.forEach((s, i) => out.push(s.run(out[i])))
    return out
  }, [])

  const rows = stages[step]
  const prev = step > 0 ? stages[step - 1] : null
  const changed = (r: Row, k: keyof Row) => {
    const p = prev?.find((x) => x.id === r.id)
    return p ? p[k] !== r[k] : false
  }
  const done = step === STEPS.length

  return (
    <div className="brut bg-paper-2 text-ink">
      <div className="label flex items-center justify-between border-b-2 border-ink bg-acid px-3 py-2 text-ink">
        <span>scrape_batch_0312.csv</span>
        <span>
          {RAW.length} rows in → {rows.length} out
        </span>
      </div>

      <div className="grid md:grid-cols-[200px_1fr]">
        <ol className="border-b-2 border-ink md:border-b-0 md:border-r-2" aria-label="Pipeline steps">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'next' : 'todo'
            return (
              <li key={s.label} className="border-b border-line last:border-b-0">
                <button
                  onClick={() => setStep(i + 1)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] ${state === 'done' ? 'bg-ink text-paper' : 'hover:bg-acid'}`}
                  aria-current={state === 'next' ? 'step' : undefined}
                >
                  <span className={`label w-5 ${state === 'done' ? 'text-acid' : 'text-muted'}`}>
                    {state === 'done' ? '✓' : String(i + 1).padStart(2, '0')}
                  </span>
                  {s.label}
                </button>
              </li>
            )
          })}
        </ol>

        <div className="min-w-0 p-3 md:p-4">
          <code className="block truncate bg-ink px-3 py-2 font-mono text-[12px] text-acid">
            {step === 0 ? '# raw scrape — nothing cleaned yet' : `>>> ${STEPS[step - 1].code}`}
          </code>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left font-mono text-[12px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="py-1.5 pr-2 font-medium">company</th>
                  <th className="py-1.5 pr-2 font-medium">date</th>
                  <th className="py-1.5 pr-2 text-right font-medium">revenue</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((r) => (
                    <motion.tr
                      layout
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.35 } }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className={`border-b border-line ${r.flag ? 'bg-red/15' : ''}`}
                    >
                      <td className="py-1.5 pr-2 whitespace-pre">
                        <span className={changed(r, 'company') ? 'bg-acid' : ''}>{r.company}</span>
                      </td>
                      <td className="py-1.5 pr-2">
                        <span className={changed(r, 'date') ? 'bg-acid' : ''}>{r.date}</span>
                      </td>
                      <td className="py-1.5 pr-2 text-right">
                        <span className={changed(r, 'revenue') ? 'bg-acid' : ''}>{(step >= 3 ? fmtInr(r.revenue) : r.revenue) || '∅'}</span>
                        {r.flag && <span className="label ml-2 bg-red px-1 text-[9px] text-ink">{r.flag}</span>}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              disabled={done}
              className="brut-sm brut-hover label flex items-center gap-2 bg-blue px-3 py-2 text-paper disabled:opacity-40"
              data-cursor="RUN"
            >
              <StepForward size={14} /> Next step
            </button>
            <button
              onClick={() => setStep(STEPS.length)}
              disabled={done}
              className="brut-sm brut-hover label flex items-center gap-2 bg-acid px-3 py-2 disabled:opacity-40"
            >
              <Play size={14} /> Run all
            </button>
            <button onClick={() => setStep(0)} className="brut-sm brut-hover label flex items-center gap-2 bg-paper px-3 py-2">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          <p className="mt-3 text-[12px] text-muted" aria-live="polite">
            {done
              ? '2 duplicates removed · 1 missing value and 1 outlier flagged for review.'
              : 'Step through the same kind of cleaning I automated at Forage AI.'}
          </p>
        </div>
      </div>
    </div>
  )
}
