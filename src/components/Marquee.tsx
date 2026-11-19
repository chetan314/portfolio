import { marquee } from '../data/portfolio'

function Track({ items, reverse = false, speed = 36 }: { items: string[]; reverse?: boolean; speed?: number }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <li key={i} className="flex items-center">
          <span className="px-5">{t}</span>
          <span aria-hidden="true" className="text-[0.6em]">✱</span>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-rev' : 'animate-marquee'} hover:[animation-play-state:paused]`}
        style={{ ['--marquee-speed' as string]: `${speed}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section aria-label="Focus areas" className="relative overflow-hidden py-10 md:py-14">
      <div className="display relative z-10 -mx-[5vw] -rotate-2 border-y-2 border-ink bg-acid py-3 text-[clamp(1.5rem,3.4vw,3rem)] text-ink">
        <Track items={marquee} />
      </div>
      <div className="display -mx-[5vw] -mt-4 rotate-[1.5deg] border-y-2 border-ink bg-ink py-3 text-[clamp(1.5rem,3.4vw,3rem)] text-paper md:-mt-6">
        <Track items={[...marquee].reverse()} reverse speed={44} />
      </div>
    </section>
  )
}
