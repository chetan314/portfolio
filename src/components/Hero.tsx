import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { profile } from '../data/portfolio'
import { EASE } from '../lib/motion'
import { scrollToId } from '../lib/scroll'
import AttentionCanvas from './AttentionCanvas'
import { Figure, Magnetic, SplitText, Sticker } from './ui'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
})

function PhotoCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`group w-40 sm:w-48 ${className}`}
      initial={{ opacity: 0, y: 30, rotate: 8 }}
      animate={{ opacity: 1, y: 0, rotate: 3 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.9 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      data-cursor="HELLO 👋"
    >
      <div className="brut relative aspect-square overflow-hidden bg-acid">
        {/* duotone: grayscale photo multiplied onto acid */}
        <img
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          width={640}
          height={640}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply grayscale contrast-125"
        />
        <img
          src={profile.photo}
          alt=""
          aria-hidden="true"
          width={640}
          height={640}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {/* halftone dots */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
          style={{ backgroundImage: 'radial-gradient(#171717 0.8px, transparent 1px)', backgroundSize: '4px 4px' }}
        />
        {/* detection box around the face */}
        <div aria-hidden="true" className="absolute left-[18%] top-[22%] h-[64%] w-[64%] border-2 border-blue">
          <span className="label absolute -top-[22px] left-[-2px] whitespace-nowrap bg-blue px-1.5 py-0.5 text-[9px] text-paper">
            human · 0.98
          </span>
        </div>
      </div>
      <div className="label mt-2 flex justify-between text-ink">
        <span>SUBJECT_01</span>
        <span className="text-muted">640×640</span>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const readout = useRef<HTMLSpanElement>(null)

  return (
    <section id="top" className="relative pt-14" aria-label="Introduction">
      <div className="container-x">
        {/* meta row */}
        <motion.div
          {...fade(0.1)}
          className="label grid grid-cols-2 gap-2 border-b-2 border-ink py-3 text-ink md:grid-cols-4"
        >
          <span>Portfolio — Vol. 2026</span>
          <span className="text-right md:text-left">M.Tech Data Science · IIT Roorkee</span>
          <span className="hidden md:block">{profile.coords}</span>
          <span className="hidden text-right md:block">{profile.role}</span>
        </motion.div>

        {/* name */}
        <h1 className="relative mt-6 md:mt-8">
          <span className="sr-only">
            {profile.name} — {profile.role}
          </span>
          <span aria-hidden="true" className="flex items-end justify-between gap-4">
            <SplitText
              text={profile.first.toUpperCase()}
              className="display name-size block"
              delay={0.15}
            />
            <motion.span {...fade(0.8)} className="mb-[2vw] hidden flex-col items-end gap-3 md:flex">
              <Sticker tone="blue" rotate={-4}>
                ● {profile.status}
              </Sticker>
              <span className="serif-i max-w-[16ch] text-right text-[clamp(1.25rem,2vw,2rem)] leading-[1.05]">
                data in, <span className="bg-acid px-1">models</span> out.
              </span>
            </motion.span>
          </span>
          <span aria-hidden="true" className="block">
            <SplitText
              text={profile.last.toUpperCase()}
              className="display name-size block"
              delay={0.35}
            />
          </span>
        </h1>

        {/* lower grid */}
        <div className="mt-8 grid gap-10 pb-16 md:mt-12 lg:grid-cols-12 lg:gap-8 lg:pb-24">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <motion.div {...fade(0.7)}>
              <p className="max-w-[30ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.1] tracking-tight">
                I build <span className="serif-i text-blue">retrieval systems</span> and{' '}
                <span className="serif-i text-blue">vision models</span> that hold up on real, messy data.
              </p>
              <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted">
                M.Tech Data Science at IIT Roorkee. Previously a year of data QA at Forage AI. Every project
                below ships with a live demo you can poke at.
              </p>
            </motion.div>

            <motion.div {...fade(0.85)} className="flex flex-wrap items-center gap-4">
              <Magnetic>
                <button
                  onClick={() => scrollToId('work')}
                  data-cursor="SCROLL ↓"
                  className="brut brut-hover flex items-center gap-3 bg-blue px-6 py-4 font-semibold text-paper"
                >
                  See the work <ArrowDown size={18} />
                </button>
              </Magnetic>
              <Magnetic>
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="LINKEDIN ↗"
                  className="brut brut-hover flex items-center gap-3 bg-paper-2 px-6 py-4 font-semibold"
                >
                  LinkedIn <ArrowUpRight size={18} />
                </a>
              </Magnetic>
            </motion.div>

            <PhotoCard className="lg:hidden" />
          </div>

          <motion.div {...fade(0.55)} className="relative lg:col-span-7">
            <PhotoCard className="absolute -right-3 -top-16 z-10 hidden lg:block xl:-right-6" />
            <Figure
              label="Fig.01 — Attention(q = cursor)"
              meta={<span className="hidden sm:inline">softmax(qKᵀ/√d)</span>}
              footer={
                <span className="flex justify-between gap-3">
                  <span ref={readout} aria-hidden="true">
                    argmax → —
                  </span>
                  <span className="hidden text-muted sm:inline">move your cursor ↗</span>
                </span>
              }
            >
              <div className="relative h-[300px] overflow-hidden md:h-[380px]">
                <AttentionCanvas
                  onReadout={(r) => {
                    if (readout.current)
                      readout.current.textContent = `q=(${r.x.toFixed(2)}, ${r.y.toFixed(2)})  argmax → "${r.token}"  w=${r.weight.toFixed(2)}`
                  }}
                />
              </div>
            </Figure>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
