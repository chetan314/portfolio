import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react'
import { profile, projects } from '../data/portfolio'
import { GithubIcon, InstagramIcon, LinkedinIcon } from './icons'
import { Magnetic, Reveal, SectionHead } from './ui'

const socials = [
  { label: 'LinkedIn', handle: '/in/chetan-nandanwar', href: profile.links.linkedin, Icon: LinkedinIcon },
  { label: 'GitHub', handle: '@chetan314', href: profile.links.github, Icon: GithubIcon },
  { label: 'Instagram', handle: '@username__string', href: profile.links.instagram, Icon: InstagramIcon },
].filter((s) => s.href)

type Line = { kind: 'in' | 'out'; body: ReactNode }

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-acid underline underline-offset-2">
    {children}
  </a>
)

function run(cmd: string): ReactNode | 'clear' {
  const c = cmd.trim().toLowerCase()
  switch (c) {
    case '':
      return null
    case 'help':
      return (
        <span className="whitespace-pre">
          {`available commands:
  whoami      who is this
  email       how to reach me
  socials     linkedin · github · instagram
  projects    what I've built
  stack       tools I reach for
  date        local time in Roorkee
  clear       clear the screen
  sudo hire   …try it`}
        </span>
      )
    case 'whoami':
      return `${profile.name} — ${profile.role}. M.Tech Data Science @ IIT Roorkee.`
    case 'email':
    case 'contact':
      return (
        <>
          → <A href={`mailto:${profile.email}`}>{profile.email}</A>
        </>
      )
    case 'socials':
    case 'linkedin':
    case 'github':
    case 'instagram':
      return (
        <span className="flex flex-col">
          {socials.map((s) => (
            <span key={s.label}>
              {s.label.toLowerCase().padEnd(10, ' ')} <A href={s.href}>{s.handle}</A>
            </span>
          ))}
        </span>
      )
    case 'projects':
    case 'ls':
      return (
        <span className="flex flex-col">
          {projects.map((p) => (
            <span key={p.id}>
              {p.code} {p.title.padEnd(20, ' ')} <span className="text-paper/50">{p.period}</span>
            </span>
          ))}
        </span>
      )
    case 'stack':
      return 'python · sql · pandas · numpy · fastapi · streamlit · docker · c++'
    case 'date':
      return new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: profile.timezone }).format(new Date()) + ' IST'
    case 'clear':
      return 'clear'
    case 'sudo hire':
    case 'sudo hire me':
    case 'sudo hire chetan':
      setTimeout(() => (window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent('Let’s work together')}`), 600)
      return <span className="bg-acid px-1 text-ink">permission granted ✓ opening your mail client…</span>
    default:
      return (
        <>
          command not found: {c}. type <span className="text-acid">help</span>
        </>
      )
  }
}

function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', body: 'chetan-os v2026.11 — type "help" to begin.' },
  ])
  const [val, setVal] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)
  const body = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight })
  }, [lines])

  const submit = (cmd: string) => {
    const out = run(cmd)
    if (out === 'clear') {
      setLines([])
    } else {
      setLines((l) => [...l, { kind: 'in', body: cmd }, ...(out ? [{ kind: 'out' as const, body: out }] : [])])
    }
    if (cmd.trim()) setHist((h) => [cmd, ...h].slice(0, 20))
    setHi(-1)
    setVal('')
  }

  return (
    <div className="brut flex h-full min-h-[420px] flex-col bg-ink text-paper" onClick={() => input.current?.focus({ preventScroll: true })}>
      <div className="label flex items-center justify-between border-b-2 border-paper/20 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="h-3 w-3 bg-red" />
          <i className="h-3 w-3 bg-acid" />
          <i className="h-3 w-3 bg-blue" />
        </span>
        <span className="text-paper/70">~/contact — zsh</span>
      </div>
      <div ref={body} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed" aria-live="polite" data-lenis-prevent>
        {lines.map((l, i) => (
          <div key={i} className={l.kind === 'in' ? 'mt-2' : 'whitespace-pre-wrap text-paper/85'}>
            {l.kind === 'in' ? (
              <>
                <span className="text-acid">➜</span> <span className="text-blue">~</span> {l.body}
              </>
            ) : (
              l.body
            )}
          </div>
        ))}
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit(val)
          }}
        >
          <label htmlFor="term" className="shrink-0">
            <span className="text-acid">➜</span> <span className="text-blue">~</span>
            <span className="sr-only">Terminal command</span>
          </label>
          <input
            id="term"
            ref={input}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' && hist.length) {
                e.preventDefault()
                const n = Math.min(hist.length - 1, hi + 1)
                setHi(n)
                setVal(hist[n])
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                const n = hi - 1
                setHi(n)
                setVal(n >= 0 ? hist[n] : '')
              }
            }}
            className="w-full bg-transparent text-paper caret-acid outline-none"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type help"
          />
        </form>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t-2 border-paper/20 p-3">
        {['help', 'whoami', 'projects', 'socials', 'sudo hire'].map((c) => (
          <button
            key={c}
            onClick={(e) => {
              e.stopPropagation()
              submit(c)
            }}
            className="label border border-paper/40 px-2 py-1 normal-case tracking-normal hover:bg-acid hover:text-ink"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" className="container-x scroll-mt-16 py-20 md:py-28" aria-labelledby="contact-title">
      <SectionHead index="07" label="Contact" note={profile.status}>
        <span id="contact-title">
          Got messy data?
          <br />
          <span className="serif-i text-blue">Let’s talk.</span>
        </span>
      </SectionHead>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic strength={0.2}>
              <a
                href={`mailto:${profile.email}`}
                data-cursor="EMAIL ↗"
                className="brut brut-hover flex items-center gap-3 bg-acid px-5 py-4 md:px-7 md:py-5"
              >
                <Mail size={22} aria-hidden="true" />
                <span className="font-mono text-[clamp(0.85rem,1.6vw,1.2rem)] font-bold break-all">{profile.email}</span>
              </a>
            </Magnetic>
            <button
              onClick={copy}
              data-cursor="COPY"
              className="brut brut-hover flex h-[58px] items-center gap-2 bg-paper-2 px-4 md:h-[68px]"
              aria-label="Copy email address"
            >
              {copied ? <Check size={18} className="text-blue" /> : <Copy size={18} />}
              <span className="label">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <ul className="border-t-2 border-ink">
            {socials.map(({ label, handle, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="VISIT ↗"
                  className="group relative isolate flex items-center justify-between gap-4 overflow-hidden border-b-2 border-ink py-5 md:py-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-left scale-x-0 bg-blue transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                  />
                  <span className="flex items-center gap-4 transition-[translate,color] duration-500 group-hover:translate-x-4 group-hover:text-paper">
                    <Icon size={26} />
                    <span className="display text-[clamp(2rem,5vw,4rem)]">{label}</span>
                  </span>
                  <span className="flex items-center gap-3 transition-[translate,color] duration-500 group-hover:-translate-x-4 group-hover:text-paper">
                    <span className="label hidden sm:inline">{handle}</span>
                    <ArrowUpRight size={30} className="transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="lg:col-span-5">
          <Terminal />
        </Reveal>
      </div>
    </section>
  )
}
