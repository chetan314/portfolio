import { useEffect, useRef } from 'react'

/**
 * Custom cursor: a solid square that tracks the pointer exactly, a lagging
 * "detection box" frame, and a mono label that appears over anything with
 * a [data-cursor="LABEL"] attribute. Fine pointers only; transform-only.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    document.documentElement.classList.add('has-cursor')

    let mx = -100
    let my = -100
    let bx = mx
    let by = my
    let scale = 1
    let target = 1
    let visible = false
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!visible) {
        visible = true
        bx = mx
        by = my
        dot.current!.style.opacity = '1'
        box.current!.style.opacity = '1'
      }
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button, input, textarea, [role="button"]')
      const label = el?.dataset.cursor ?? ''
      const interactive = !!el
      const isText = el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA'
      target = isText ? 0.6 : interactive ? 1.9 : 1
      const t = tag.current!
      if (label) {
        t.textContent = label
        t.style.opacity = '1'
      } else {
        t.style.opacity = '0'
      }
    }
    const onLeave = () => {
      visible = false
      dot.current!.style.opacity = '0'
      box.current!.style.opacity = '0'
      tag.current!.style.opacity = '0'
    }
    const onDown = () => (target *= 0.8)
    const onUp = () => (target /= 0.8)

    const loop = () => {
      bx += (mx - bx) * 0.2
      by += (my - by) * 0.2
      scale += (target - scale) * 0.18
      dot.current!.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`
      box.current!.style.transform = `translate3d(${bx - 16}px, ${by - 16}px, 0) scale(${scale})`
      tag.current!.style.transform = `translate3d(${bx + 26}px, ${by + 18}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <>
      {/* difference blending keeps the cursor visible on every colour block */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden mix-blend-difference [@media(pointer:fine)]:block">
        <div ref={box} className="fixed left-0 top-0 h-8 w-8 opacity-0 transition-opacity duration-200 will-change-transform">
          {/* four corner brackets = a detection box */}
          <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-white" />
          <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-white" />
          <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white" />
        </div>
        <div ref={dot} className="fixed left-0 top-0 h-2 w-2 bg-white opacity-0 will-change-transform" />
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[101] hidden [@media(pointer:fine)]:block">
        <div
          ref={tag}
          className="label fixed left-0 top-0 whitespace-nowrap border-2 border-ink bg-acid px-2 py-1 text-ink opacity-0 transition-opacity duration-150 will-change-transform"
        />
      </div>
    </>
  )
}
