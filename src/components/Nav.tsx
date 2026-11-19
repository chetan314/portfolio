import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { nav, profile } from '../data/portfolio'
import { scrollToId } from '../lib/scroll'
import { EASE } from './ui'

export function Nav() {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', ...nav.map((n) => n.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id === 'top' ? 0 : id)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-[background-color,border-color] duration-500 ${
          scrolled ? 'glass' : 'border border-transparent'
        }`}
      >
        <a href="#top" onClick={go('top')} className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet font-display text-sm font-bold text-void">
            CN
          </span>
          <span className="hidden font-display text-sm font-medium sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={go(n.id)}
                className={`relative block rounded-full px-4 py-2 text-sm transition-colors ${
                  active === n.id ? 'text-ink' : 'text-slate hover:text-ink'
                }`}
              >
                {active === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${profile.email}`}
          className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-slate transition-colors hover:border-cyan/50 hover:text-cyan md:inline-flex"
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Available
        </a>

        <button
          className="grid h-10 w-10 place-items-center rounded-full text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="glass mx-auto mt-2 max-w-6xl rounded-3xl bg-obsidian/90 p-3 md:hidden"
          >
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={go(n.id)}
                className="block rounded-2xl px-4 py-3 font-display text-lg text-ink hover:bg-white/5"
              >
                {n.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
