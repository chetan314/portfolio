import { ArrowUp, ArrowUpRight, Check, Copy, Send } from 'lucide-react'
import { useState } from 'react'
import { profile } from '../data/portfolio'
import { scrollToId } from '../lib/scroll'
import { GithubIcon, LinkedinIcon } from './icons'
import { Magnetic, Reveal, SpotlightCard } from './ui'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name || 'your portfolio'}`)}&body=${encodeURIComponent(msg)}`

  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-violet/20 blur-[120px]" />
      <Reveal className="mb-12 text-center">
        <p className="eyebrow mb-4">Contact</p>
        <h2 className="font-display text-5xl leading-[0.95] font-semibold tracking-tight text-balance md:text-7xl">
          Let’s build something <span className="text-gradient">that ships.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate">
          Hiring for ML, data science or applied research? I’d like to hear about it.
        </p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <SpotlightCard className="flex h-full flex-col p-6 font-mono text-sm md:p-8">
            <p className="text-slate">
              <span className="text-cyan">$</span> whoami --contact
            </p>
            <div className="mt-5 space-y-3">
              <div>
                <p className="text-[11px] text-slate">email</p>
                <div className="mt-1 flex items-center gap-2">
                  <a href={`mailto:${profile.email}`} className="truncate text-ink hover:text-cyan">
                    {profile.email}
                  </a>
                  <button onClick={copy} aria-label="Copy email address" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-slate hover:text-cyan">
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="mt-1 h-4 text-[11px] text-emerald-400" aria-live="polite">
                  {copied ? 'copied to clipboard' : ''}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate">location</p>
                <p className="mt-1 text-ink">{profile.location}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate">status</p>
                <p className="mt-1 flex items-center gap-2 text-emerald-300">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> {profile.status}
                </p>
              </div>
            </div>
            <div className="mt-auto flex gap-3 pt-8">
              <Magnetic>
                <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-11 w-11 place-items-center rounded-full border border-line text-slate hover:border-cyan/50 hover:text-cyan">
                  <GithubIcon />
                </a>
              </Magnetic>
              {profile.links.linkedin && (
                <Magnetic>
                  <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-11 w-11 place-items-center rounded-full border border-line text-slate hover:border-cyan/50 hover:text-cyan">
                    <LinkedinIcon />
                  </a>
                </Magnetic>
              )}
              {profile.links.resume && (
                <Magnetic>
                  <a href={profile.links.resume} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line px-4 text-xs text-slate hover:border-cyan/50 hover:text-cyan">
                    Resume <ArrowUpRight size={14} />
                  </a>
                </Magnetic>
              )}
            </div>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={0.08}>
          <SpotlightCard className="h-full p-6 md:p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                window.location.href = mailto
              }}
              className="flex h-full flex-col gap-4"
            >
              <div>
                <label htmlFor="c-name" className="font-mono text-[11px] text-slate">
                  your name
                </label>
                <input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-ink placeholder:text-slate/50 focus:border-cyan/50 focus:outline-none"
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label htmlFor="c-msg" className="font-mono text-[11px] text-slate">
                  message
                </label>
                <textarea
                  id="c-msg"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  required
                  rows={6}
                  className="mt-1.5 w-full flex-1 resize-none rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-ink placeholder:text-slate/50 focus:border-cyan/50 focus:outline-none"
                  placeholder="Tell me about the role or project…"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate">Opens your email app with the message filled in.</p>
                <Magnetic>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-void transition-[background-color,box-shadow] duration-300 hover:bg-cyan hover:shadow-[0_0_40px_-6px_rgb(0_240_255/0.6)]"
                  >
                    Send <Send size={15} />
                  </button>
                </Magnetic>
              </div>
            </form>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-line px-4 py-10 text-sm text-slate sm:flex-row sm:px-6">
      <p>
        © {new Date().getFullYear()} {profile.name}. Built with React, Framer Motion and a canvas.
      </p>
      <button onClick={() => scrollToId(0)} className="inline-flex items-center gap-2 font-mono text-xs hover:text-cyan">
        Back to top <ArrowUp size={14} />
      </button>
    </footer>
  )
}
