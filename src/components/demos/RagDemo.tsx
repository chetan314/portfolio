import { useDeferredValue, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { search } from '../../lib/retrieval'
import { EASE } from '../../lib/motion'

const SUGGESTIONS = [
  'Can police detain me without a lawyer?',
  'What does Art. 21-A say?',
  'freedom of the press',
  'article 243 g panchayat powers',
  'can parliament change the constitution',
]

function Bar({ value, tone }: { value: number; tone: 'blue' | 'orange' | 'ink' }) {
  const bg = { blue: 'bg-blue', orange: 'bg-orange', ink: 'bg-ink' }[tone]
  return (
    <span className="relative block h-2.5 w-full border border-ink bg-paper">
      <motion.span
        className={`absolute inset-y-0 left-0 origin-left ${bg}`}
        style={{ width: '100%' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.min(1, Math.max(0, value)) }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </span>
  )
}

export default function RagDemo() {
  const [q, setQ] = useState(SUGGESTIONS[0])
  const [alpha, setAlpha] = useState(0.5)
  const dq = useDeferredValue(q)
  const res = useMemo(() => search(dq, alpha, 3), [dq, alpha])

  return (
    <div className="brut bg-paper-2 text-ink">
      <div className="label flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2 text-paper">
        <span>retriever.search()</span>
        <span className="text-acid">{res.ms.toFixed(2)} ms · 18 docs</span>
      </div>

      <div className="p-4 md:p-5">
        <label htmlFor="rag-q" className="label text-muted">
          Ask the Constitution
        </label>
        <div className="mt-2 flex items-center gap-2 border-2 border-ink bg-paper px-3 focus-within:outline focus-within:outline-3 focus-within:outline-blue">
          <Search size={16} aria-hidden="true" />
          <input
            id="rag-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent py-2.5 font-mono text-[14px] outline-none"
            placeholder="e.g. right to education"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.slice(1).map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="label border border-ink bg-paper px-2 py-1 normal-case tracking-normal transition-colors hover:bg-acid"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 border-t-2 border-ink pt-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="label flex justify-between text-muted">
              <span>← lexical (BM25)</span>
              <span>semantic →</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="range mt-1"
              aria-label="Fusion weight between lexical and semantic retrieval"
              data-cursor="DRAG"
            />
          </div>
          <span className="label bg-acid px-2 py-1 text-center">α = {alpha.toFixed(2)}</span>
        </div>

        <div className="label mt-3 flex flex-wrap items-center gap-1.5 text-muted">
          <span>tokens:</span>
          {res.tokens.length ? (
            res.tokens.slice(0, 8).map((t, i) => (
              <span key={t + i} className="border border-line bg-paper px-1 normal-case text-ink">
                {t}
              </span>
            ))
          ) : (
            <span>—</span>
          )}
          {res.citations.map((c) => (
            <span key={c} className="bg-blue px-1.5 text-paper">
              cite: Art. {c}
            </span>
          ))}
        </div>

        <ol className="mt-4 space-y-2" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {res.hits.length === 0 && (
              <motion.li
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-2 border-dashed border-ink p-4 text-[14px] text-muted"
              >
                No relevant articles in this 18-article slice. Try “arrest”, “religion” or “Article 32”.
              </motion.li>
            )}
            {res.hits.map((h, i) => (
              <motion.li
                layout
                key={h.article.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: EASE }}
                className={`border-2 border-ink p-3 ${i === 0 ? 'bg-acid' : 'bg-paper'}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold">
                    <span className="font-mono">Art. {h.article.id}</span> — {h.article.title}
                  </span>
                  <span className="label shrink-0">{h.cited ? 'cited ★' : h.score.toFixed(2)}</span>
                </div>
                {i === 0 && <p className="mt-1.5 text-[13px] leading-snug">{h.article.text}</p>}
                <div className="label mt-2 grid grid-cols-[52px_1fr] items-center gap-x-2 gap-y-1 normal-case tracking-normal">
                  <span>bm25</span>
                  <Bar value={h.lexical} tone="ink" />
                  <span>dense</span>
                  <Bar value={h.dense} tone="blue" />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          Paraphrased 18-article slice; “dense” uses a hand-built concept space so the demo runs without a model.
        </p>
      </div>
    </div>
  )
}
