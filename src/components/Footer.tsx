import { ArrowUp } from 'lucide-react'
import { profile } from '../data/portfolio'
import { scrollToId } from '../lib/scroll'

export default function Footer() {
  return (
    <footer className="overflow-hidden border-t-2 border-ink bg-ink text-paper">
      <div className="container-x label flex flex-wrap items-center justify-between gap-4 py-5">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="hidden text-paper/60 md:inline">Built with React, Framer Motion & a lot of chai — Roorkee, IN</span>
        <button
          onClick={() => scrollToId('top')}
          data-cursor="TOP ↑"
          className="flex items-center gap-2 border-2 border-paper px-3 py-1.5 hover:bg-acid hover:text-ink"
        >
          Back to top <ArrowUp size={14} />
        </button>
      </div>
      <div aria-hidden="true" className="display select-none whitespace-nowrap pb-2 text-center text-[13.5vw] leading-[0.8] text-acid">
        {profile.last.toUpperCase()}
      </div>
    </footer>
  )
}
