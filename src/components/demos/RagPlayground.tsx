import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { search } from '../../lib/retrieval'
import { EASE } from '../ui'

const SUGGESTIONS = [
  'Can police detain me without telling me why?',
  'Art. 21-A',
  'freedom of the press',
  'how is the constitution amended',
  'who protects my property?',
]

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        className="h-full origin-left rounded-full"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0.02, Math.min(1, value)) }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </div>
  )
}

/** In-browser hybrid retrieval over a slice of the Constitution of India. */
export function RagPlayground() {
  const [query, setQuery] = useState(SUGGESTIONS[0])
  const [alpha, setAlpha] = useState(0.5)
  const q = useDeferredValue(query)
  const result = useMemo(() => search(q, alpha), [q, alpha])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-void/70 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[11px] text-slate">
        <span>
          <span className="text-cyan">●</span> retriever.playground
        </span>
        <span className="tabular-nums">
          {result.ms.toFixed(2)} ms<span className="hidden sm:inline"> · in-browser</span>
        </span>
      </div>

      <form className="p-4 pb-3" onSubmit={(e) => e.preventDefault()} role="search">
        <label htmlFor="rag-q" className="sr-only">
          Ask a question about the Constitution of India
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 focus-within:border-cyan/50">
          <Search size={14} className="shrink-0 text-slate" />
          <input
            id="rag-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about rights, courts, Article 21A…"
            className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-slate/60 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <CornerDownLeft size={14} className="shrink-0 text-slate/60" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className={`rounded-full border px-2.5 py-1 text-[10.5px] transition-colors ${
                s === query ? 'border-cyan/50 text-cyan' : 'border-line text-slate hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      <div className="flex items-center gap-3 border-y border-line px-4 py-2.5 text-[11px] text-slate">
        <span className="shrink-0">BM25</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={alpha}
          onChange={(e) => setAlpha(Number(e.target.value))}
          aria-label="Balance between lexical and semantic retrieval"
          className="w-full accent-cyan"
        />
        <span className="shrink-0">dense</span>
        <span className="w-9 shrink-0 text-right text-ink tabular-nums">α={alpha.toFixed(2)}</span>
      </div>

      <div className="px-4 pt-3 text-[10.5px] leading-relaxed text-slate">
        <span className="text-violet-300">tokens</span> [{result.tokens.join(', ')}]
        {result.citations.length > 0 && (
          <>
            {'  '}
            <span className="text-violet-300">citation</span> <span className="text-cyan">Art. {result.citations.join(', ')}</span>
          </>
        )}
      </div>

      <ol className="flex-1 space-y-2 p-4 pt-3" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {result.hits.length === 0 && (
            <motion.li key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center text-slate">
              No passages retrieved. Try “speech”, “arrest” or “Article 32”.
            </motion.li>
          )}
          {result.hits.map((h, i) => (
            <motion.li
              key={h.article.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="rounded-xl border border-line bg-white/[0.02] p-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-sans text-[13px] font-medium text-ink">
                  <span className="mr-2 font-mono text-cyan">#{i + 1}</span>
                  Art. {h.article.id} · {h.article.title}
                </p>
                {h.cited && <span className="shrink-0 rounded bg-cyan/10 px-1.5 py-0.5 text-[10px] text-cyan">cited</span>}
              </div>
              <p className="mt-1.5 line-clamp-2 font-sans text-[12px] leading-relaxed text-slate">{h.article.text}</p>
              <div className="mt-2.5 grid grid-cols-[3.2rem_1fr_2.4rem] items-center gap-x-2 gap-y-1 text-[10px] text-slate">
                <span>bm25</span>
                <Bar value={h.lexical} color="#7c3aed" />
                <span className="text-right tabular-nums">{h.lexical.toFixed(2)}</span>
                <span>dense</span>
                <Bar value={h.dense} color="#00f0ff" />
                <span className="text-right tabular-nums">{h.dense.toFixed(2)}</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <p className="border-t border-line px-4 py-2.5 text-[10px] leading-relaxed text-slate/70">
        Demo runs real BM25 plus a concept-vector stand-in for embeddings over 18 paraphrased articles; the real system searches the full text
        with semantic embeddings.
      </p>
    </div>
  )
}
