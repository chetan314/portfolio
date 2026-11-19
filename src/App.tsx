import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect } from 'react'
import { About } from './components/About'
import { Contact, Footer } from './components/Contact'
import { Cursor } from './components/Cursor'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { Research } from './components/Research'
import { Skills } from './components/Skills'
import { startSmoothScroll } from './lib/scroll'

export default function App() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })

  useEffect(() => startSmoothScroll(), [])

  return (
    <>
      <a href="#work" className="sr-only z-[200] rounded-full bg-ink px-4 py-2 text-void focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gradient-to-r from-violet to-cyan" />
      <div className="dot-grid pointer-events-none fixed inset-0 -z-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Research />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
