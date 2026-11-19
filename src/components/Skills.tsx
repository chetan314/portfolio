import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { matrixColumns, skills, type SkillGroup } from '../data/portfolio'
import { EASE } from '../lib/motion'
import { Reveal, SectionHead } from './ui'

const GROUPS: ('All' | SkillGroup)[] = ['All', 'Languages', 'Data & ML', 'Serving', 'Research', 'Foundations']
const CELL_TONE = ['bg-blue', 'bg-orange', 'bg-acid', 'bg-ink', 'bg-red']

export default function Skills() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('All')
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const rows = useMemo(() => (group === 'All' ? skills : skills.filter((s) => s.group === group)), [group])

  return (
    <section id="skills" className="container-x scroll-mt-16 py-20 md:py-28" aria-labelledby="skills-title">
      <SectionHead index="06" label="Skills matrix" note="skill × where I actually used it">
        <span id="skills-title">
          Skills, <span className="serif-i text-blue">with receipts</span>
        </span>
      </SectionHead>

      <Reveal>
        <div role="group" aria-label="Filter skills" className="mb-6 flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              aria-pressed={group === g}
              className={`label relative isolate border-2 border-ink px-3 py-2 ${group === g ? 'text-ink' : 'bg-paper-2 text-ink hover:bg-paper'}`}
            >
              {group === g && (
                <motion.span layoutId="skill-pill" className="absolute inset-0 -z-10 bg-acid" transition={{ duration: 0.4, ease: EASE }} />
              )}
              {g}
              <span className="ml-1.5 text-muted">{g === 'All' ? skills.length : skills.filter((s) => s.group === g).length}</span>
            </button>
          ))}
        </div>

        <div className="brut overflow-x-auto bg-paper-2">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <caption className="sr-only">Skills and the projects where each was used</caption>
            <thead>
              <tr className="border-b-2 border-ink bg-ink text-paper">
                <th scope="col" className="label px-4 py-3 font-medium">
                  Skill
                </th>
                <th scope="col" className="label hidden px-3 py-3 font-medium md:table-cell">
                  Group
                </th>
                {matrixColumns.map((c, i) => (
                  <th
                    key={c.id}
                    scope="col"
                    className={`label w-[11%] px-2 py-3 text-center font-medium transition-colors ${hoverCol === i ? 'bg-acid text-ink' : ''}`}
                    onMouseEnter={() => setHoverCol(i)}
                    onMouseLeave={() => setHoverCol(null)}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false} mode="popLayout">
                {rows.map((s) => (
                  <motion.tr
                    layout
                    key={s.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="group border-b border-line last:border-b-0 hover:bg-paper"
                  >
                    <th scope="row" className="px-4 py-2.5 text-[15px] font-semibold">
                      {s.name}
                    </th>
                    <td className="label hidden px-3 py-2.5 text-muted md:table-cell">{s.group}</td>
                    {matrixColumns.map((c, i) => {
                      const on = s.used.includes(c.id)
                      return (
                        <td
                          key={c.id}
                          className={`px-2 py-2.5 text-center ${hoverCol === i ? 'bg-acid/30' : ''}`}
                          onMouseEnter={() => setHoverCol(i)}
                          onMouseLeave={() => setHoverCol(null)}
                        >
                          {on ? (
                            <span
                              className={`inline-block h-5 w-5 border-2 border-ink transition-transform duration-300 group-hover:scale-110 ${CELL_TONE[i]}`}
                              aria-label={`used in ${c.label}`}
                              role="img"
                            />
                          ) : (
                            <span className="inline-block h-1.5 w-1.5 bg-line" aria-label="not used" role="img" />
                          )}
                        </td>
                      )
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <p className="label mt-3 text-muted">■ = used in that project · coursework foundations listed without a project</p>
      </Reveal>
    </section>
  )
}
