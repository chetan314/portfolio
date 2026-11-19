import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { nav, profile } from '../data/portfolio'
import { scrollToId, lockScroll } from '../lib/scroll'
import { EASE } from '../lib/motion'

function useClock(tz: string) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15_000)
    return () => clearInterval(id)
  }, [])
  return t
}

function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const time = useClock(profile.timezone)
  const active = useActiveSection()

  useEffect(() => {
    lockScroll(open)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // wait a frame so the overlay unlocks scrolling first
    requestAnimationFrame(() => scrollToId(id))
  }

  return (
    <>
      <a
        href="#main"
        className="label fixed left-2 top-2 z-[120] -translate-y-20 bg-acid px-3 py-2 text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-[2px]">
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <button
            onClick={() => go('top')}
            data-cursor="TOP ↑"
            className="flex items-center gap-3"
            aria-label="Back to top"
          >
            <span className="display flex h-9 w-9 items-center justify-center border-2 border-ink bg-acid text-[15px] tracking-tight">
              CN
            </span>
            <span className="label hidden text-ink sm:inline">{profile.name}</span>
          </button>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center">
              {nav.map((n, i) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      go(n.id)
                    }}
                    className="label relative isolate flex items-center gap-1.5 px-3 py-2 text-ink"
                    aria-current={active === n.id ? 'true' : undefined}
                  >
                    {active === n.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 border-2 border-ink bg-acid"
                        transition={{ duration: 0.45, ease: EASE }}
                      />
                    )}
                    <span className="text-muted">{String(i + 1).padStart(2, '0')}</span>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <span className="label hidden items-center gap-2 text-ink md:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 animate-ping bg-blue opacity-60" />
                <span className="relative h-2.5 w-2.5 bg-blue" />
              </span>
              IST {time}
            </span>
            <a
              href={`#contact`}
              onClick={(e) => {
                e.preventDefault()
                go('contact')
              }}
              data-cursor="SAY HI"
              className="label brut-sm brut-hover hidden bg-blue px-3 py-2 text-paper sm:inline-block"
            >
              Hire me ↗
            </a>
            <button
              className="brut-sm flex h-9 w-9 items-center justify-center bg-paper-2 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-40 flex flex-col bg-blue pt-14 text-paper"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <ul className="container-x flex flex-1 flex-col justify-center gap-1">
              {nav.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.05 }}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      go(n.id)
                    }}
                    className="flex items-baseline gap-4 border-b-2 border-paper/30 py-2"
                  >
                    <span className="label text-acid">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display text-[13vw] sm:text-7xl">{n.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="container-x label flex justify-between pb-6 text-paper/80">
              <span>{profile.location}</span>
              <span>IST {time}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
