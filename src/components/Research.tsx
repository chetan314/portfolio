import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { profile, publications, researchInterests } from '../data/portfolio'
import { EASE } from '../lib/motion'
import { Reveal, SectionHead, Sticker } from './ui'

type Pub = (typeof publications)[number]

const bibtex = (p: Pub) => `@article{${p.key},
  title     = {${p.title}},
  author    = {${p.authors.join(' and ')}},
  journal   = {${p.venue}},
  publisher = {${p.publisher}},
  year      = {${p.year}}
}`

function PubCard({ p, i }: { p: Pub; i: number }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex(p))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setShow(true)
    }
  }

  return (
    <article className="brut bg-paper-2" aria-labelledby={`pub-${p.key}`}>
      <div className="grid md:grid-cols-[160px_1fr]">
        <div className="flex items-center justify-between border-b-2 border-ink p-4 md:flex-col md:items-start md:border-b-0 md:border-r-2">
          <span className="display text-[44px] leading-none">[{i + 1}]</span>
          <span className="display text-outline text-[56px] leading-none md:text-[64px]">{p.year}</span>
        </div>
        <div className="p-5 md:p-7">
          <span className="label text-muted">{p.topic}</span>
          <h3 id={`pub-${p.key}`} className="mt-2 text-[clamp(1.25rem,2.2vw,1.75rem)] font-bold leading-tight tracking-tight">
            {p.title}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed">
            {p.authors.map((a, j) => (
              <span key={a}>
                {a.includes(profile.last) ? <span className="bg-acid px-0.5 font-semibold">{a}</span> : a}
                {j < p.authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p className="serif-i mt-1 text-[19px]">{p.venue}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={copy}
              data-cursor="COPY"
              className="brut-sm brut-hover label flex items-center gap-2 bg-blue px-3 py-2 text-paper"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied BibTeX' : 'Copy BibTeX'}
            </button>
            <button
              onClick={() => setShow((s) => !s)}
              aria-expanded={show}
              className="brut-sm brut-hover label bg-paper px-3 py-2"
            >
              {show ? 'Hide' : 'Show'} citation
            </button>
          </div>

          <AnimatePresence initial={false}>
            {show && (
              <motion.pre
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-4 overflow-hidden bg-ink font-mono text-[12px] leading-relaxed text-paper"
              >
                <code className="block overflow-x-auto p-4">
                  {bibtex(p)}
                </code>
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  )
}

export default function Research() {
  return (
    <section id="research" className="container-x scroll-mt-16 py-20 md:py-28" aria-labelledby="research-title">
      <SectionHead index="05" label="Research" note="peer-reviewed · applied ML">
        <span id="research-title">
          Published <span className="serif-i text-blue">&amp; cited</span>
        </span>
      </SectionHead>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          {publications.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.08}>
              <PubCard p={p} i={i} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="lg:col-span-4">
          <aside className="relative lg:sticky lg:top-24">
            <Sticker tone="acid" rotate={-3} className="absolute -top-4 left-4 z-10">
              Now researching
            </Sticker>
            <div className="brut bg-orange p-6 pt-8">
              <p className="text-[clamp(1.4rem,2.2vw,1.9rem)] font-bold leading-[1.1] tracking-tight">
                Making vision models survive the jump from benchmark to{' '}
                <span className="serif-i font-normal">operating room.</span>
              </p>
              <ul className="mt-6 border-t-2 border-ink">
                {researchInterests.map((r, i) => (
                  <li key={r} className="flex items-baseline justify-between border-b-2 border-ink py-2.5 text-[15px] font-medium">
                    {r}
                    <span className="label">{String(i + 1).padStart(2, '0')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  )
}
