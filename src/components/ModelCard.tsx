import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { modelCard } from '../data/portfolio'
import { EASE } from '../lib/motion'
import { Counter, Reveal, SectionHead, Sticker } from './ui'

const TABS = ['README', 'Training data', 'Usage'] as const
type Tab = (typeof TABS)[number]

const USAGE = `from portfolio import Engineer

model = Engineer.from_pretrained(
    "${modelCard.id}",
    domain=["rag", "computer-vision", "data"],
)

model.fit(your_messy_dataset)   # cleans it first
model.deploy(api="fastapi", container="docker")`

export default function ModelCard() {
  const [tab, setTab] = useState<Tab>('README')
  const [copied, setCopied] = useState(false)

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(modelCard.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked: ignore */
    }
  }

  return (
    <section id="about" className="container-x scroll-mt-16 py-20 md:py-28" aria-labelledby="about-title">
      <SectionHead index="02" label="Model card" note="about · who's behind the weights">
        <span id="about-title">
          Most model problems
          <br />
          are <span className="serif-i text-blue">data problems.</span>
        </span>
      </SectionHead>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* the card */}
        <Reveal className="lg:col-span-7">
          <article className="brut bg-paper-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
              <button
                onClick={copyId}
                data-cursor="COPY"
                className="flex min-w-0 items-center gap-2 font-mono text-[13px] font-medium"
                aria-label={`Copy model id ${modelCard.id}`}
              >
                <span className="truncate">{modelCard.id}</span>
                {copied ? <Check size={14} className="text-blue" /> : <Copy size={14} className="text-muted" />}
              </button>
              <span className="label text-muted">♥ 2 papers · updated Nov 2026</span>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b-2 border-ink px-4 py-3">
              {modelCard.tags.map((t) => (
                <span key={t} className="label border border-ink bg-paper px-1.5 py-0.5 normal-case tracking-normal">
                  {t}
                </span>
              ))}
            </div>

            <div role="tablist" aria-label="Model card sections" className="flex border-b-2 border-ink">
              {TABS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  id={`tab-${t}`}
                  aria-selected={tab === t}
                  aria-controls="mc-panel"
                  onClick={() => setTab(t)}
                  className={`label relative flex-1 border-r-2 border-ink px-3 py-3 last:border-r-0 sm:flex-none sm:px-5 ${
                    tab === t ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {t}
                  {tab === t && (
                    <motion.span
                      layoutId="mc-tab"
                      className="absolute inset-x-0 -bottom-[2px] h-[5px] bg-blue"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div id="mc-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-h-[340px] p-5 md:p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {tab === 'README' && (
                    <div>
                      {modelCard.pitch.map((p) => (
                        <p key={p} className="mb-4 max-w-[62ch] text-[16px] leading-relaxed">
                          {p}
                        </p>
                      ))}
                      <dl className="mt-6 border-t-2 border-ink">
                        {modelCard.rows.map((r) => (
                          <div key={r.k} className="grid grid-cols-[minmax(110px,30%)_1fr] gap-4 border-b border-line py-2.5">
                            <dt className="label pt-0.5 text-muted">{r.k}</dt>
                            <dd className="text-[14px]">{r.v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {tab === 'Training data' && (
                    <ol className="space-y-3">
                      {modelCard.training.map((e, i) => (
                        <li key={e.k} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b-2 border-ink pb-3">
                          <span className="label text-muted">D/{String(i + 1).padStart(2, '0')}</span>
                          <span>
                            <span className="block text-[17px] font-semibold leading-tight">{e.k}</span>
                            <span className="text-[14px] text-muted">
                              {e.v} · {e.when}
                            </span>
                          </span>
                          <span className="label bg-acid px-2 py-1 text-ink">{e.score}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {tab === 'Usage' && (
                    <pre className="overflow-x-auto bg-ink p-5 font-mono text-[13px] leading-relaxed text-paper">
                      <code>
                        {USAGE.split('\n').map((line, i) => (
                          <span key={i} className="block">
                            <span className="mr-4 inline-block w-4 select-none text-right text-paper/35">{i + 1}</span>
                            {line.includes('#') ? (
                              <>
                                {line.split('#')[0]}
                                <span className="text-acid">#{line.split('#')[1]}</span>
                              </>
                            ) : (
                              line
                            )}
                          </span>
                        ))}
                      </code>
                    </pre>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </article>
        </Reveal>

        {/* eval results */}
        <Reveal delay={0.12} className="lg:col-span-5 lg:pt-16">
          <div className="relative">
            <Sticker tone="orange" rotate={4} className="absolute -top-4 right-4 z-10">
              Eval results ✓ verified
            </Sticker>
            <div className="brut grid grid-cols-2 bg-ink text-paper">
              {modelCard.metrics.map((m, i) => (
                <div
                  key={m.label}
                  className={`flex flex-col justify-between gap-6 p-5 md:p-6 ${i % 2 === 0 ? 'border-r-2 border-paper/20' : ''} ${
                    i < 2 ? 'border-b-2 border-paper/20' : ''
                  }`}
                >
                  <Counter
                    to={m.value}
                    suffix={m.suffix}
                    className={`display text-[clamp(3rem,6vw,5rem)] ${i === 0 ? 'text-acid' : ''}`}
                  />
                  <span className="text-[13px] leading-snug text-paper/75">{m.label}</span>
                </div>
              ))}
            </div>
            <p className="label mt-4 text-muted">↳ measured in production at Forage AI · peer-reviewed</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
