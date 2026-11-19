import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

/** Dot + trailing ring cursor. Only mounts on fine pointers without reduced motion. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    setEnabled(true)
    document.documentElement.classList.add('has-cursor')

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const t = e.target as Element | null
      setHover(!!t?.closest('a, button, input, textarea, [role="tab"], [data-cursor="hover"]'))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [x, y])

  if (!enabled) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div
        className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-cyan"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="absolute top-0 left-0 h-14 w-14 rounded-full border border-cyan/60 bg-cyan/10"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        initial={{ scale: 0.55 }}
        animate={{ scale: hover ? 1 : 0.55, opacity: hover ? 1 : 0.7 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
