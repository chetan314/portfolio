import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { initSmoothScroll } from './lib/scroll'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import ModelCard from './components/ModelCard'
import Work from './components/Work'
import TrainingLog from './components/TrainingLog'
import Research from './components/Research'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'

/** Faint 12-column grid: the visible scaffolding of the layout. */
function GridOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="container-x grid h-full grid-cols-4 gap-4 md:grid-cols-12 md:gap-8">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`border-x border-ink/[0.045] ${i >= 4 ? 'hidden md:block' : ''}`} />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  return (
    <MotionConfig reducedMotion="user">
      <GridOverlay />
      <Cursor />
      <Nav />
      <main id="main" className="relative z-[1]">
        <Hero />
        <Marquee />
        <ModelCard />
        <Work />
        <TrainingLog />
        <Research />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
