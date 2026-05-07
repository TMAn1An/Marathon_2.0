import { motion } from 'framer-motion'

const TONE_STYLES = {
  student: { color: '#ED1C24', label: 'text-brand-700' },
  faculty: { color: '#181c25', label: 'text-ink-800' },
  guest: { color: '#fbbf24', label: 'text-amber-600' },
}

/**
 * Animated registration analytics donut.
 * NEVER renders raw counts — only percentages from the backend.
 */
export default function Donut({ segments = [], note }) {
  const safe = segments.length ? segments : [{ label: '—', percent: 0, tone: 'student' }]
  const total = safe.reduce((acc, s) => acc + Number(s.percent || 0), 0)
  const remaining = Math.max(0, 100 - total)

  const r = 70
  const C = 2 * Math.PI * r

  const segmentSpecs = safe.reduce((acc, s) => {
    const value = Math.max(0, Number(s.percent || 0))
    const len = (value / 100) * C
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].len
    return [...acc, { ...s, len, offset }]
  }, [])

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
      <div className="relative mx-auto h-52 w-52">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(15,17,24,0.06)" strokeWidth="22" />
          {segmentSpecs.map((s) => {
            const dasharray = `${s.len} ${C - s.len}`
            const dashoffset = -s.offset
            return (
              <motion.circle
                key={s.label}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={TONE_STYLES[s.tone]?.color ?? '#ED1C24'}
                strokeWidth="22"
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${C}`, strokeDashoffset: 0 }}
                whileInView={{ strokeDasharray: dasharray, strokeDashoffset: dashoffset }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-ink-900">{remaining.toFixed(0)}%</span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-500">Open</span>
        </div>
      </div>
      <div>
        <ul className="space-y-3">
          {safe.map((s) => {
            const tone = TONE_STYLES[s.tone] ?? TONE_STYLES.student
            return (
              <li
                key={s.label}
                className="flex items-center justify-between gap-3 rounded-xl bg-ink-50/70 px-4 py-3 ring-1 ring-ink-100"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-ink-800">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: tone.color }} />
                  {s.label}
                </span>
                <span className={`text-sm font-bold ${tone.label}`}>{Number(s.percent || 0).toFixed(1)}%</span>
              </li>
            )
          })}
        </ul>
        {note && <p className="mt-4 text-xs leading-relaxed text-ink-500">{note}</p>}
      </div>
    </div>
  )
}
