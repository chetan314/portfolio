import Lenis from 'lenis'

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
  let raf = 0
  const loop = (time: number) => {
    lenis?.raf(time)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    lenis?.destroy()
    lenis = null
  }
}

/** Scroll to a section id (or 0 for the top), using Lenis when it is running. */
export function scrollToId(id: string | 0) {
  const target = id === 0 ? 0 : document.getElementById(id)
  if (target === null) return
  if (lenis) {
    lenis.scrollTo(target, { offset: id === 0 ? 0 : -72 })
  } else if (target === 0) {
    window.scrollTo({ top: 0 })
  } else {
    target.scrollIntoView()
  }
  if (id !== 0) history.replaceState(null, '', `#${id}`)
}
