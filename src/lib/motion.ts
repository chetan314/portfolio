export const EASE = [0.22, 1, 0.36, 1] as const

export const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

export const stagger = (s = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: s, delayChildren: delay } },
})
