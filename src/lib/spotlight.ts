import type { PointerEvent } from 'react'

/** Pointer handlers that drive the `.spotlight` CSS effect on any element. */
export const spotlightHandlers = {
  onPointerMove(e: PointerEvent<HTMLElement>) {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    el.style.setProperty('--spot', '1')
  },
  onPointerLeave(e: PointerEvent<HTMLElement>) {
    e.currentTarget.style.setProperty('--spot', '0')
  },
}
