import { useCountdown } from '../hooks/useCountdown'

function Cell({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2 text-center min-w-[70px] backdrop-blur-sm">
      <div className="text-2xl font-bold text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-accent-300">
        {label}
      </div>
    </div>
  )
}

export default function CountdownClock({ targetDate }) {
  const t = useCountdown(targetDate)
  if (!t) return null

  if (t.expired) {
    return (
      <div className="inline-flex items-center rounded-lg bg-accent-400 px-4 py-2 text-sm font-semibold text-brand-900">
        Race day is here!
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Cell label="Days" value={t.days} />
      <Cell label="Hrs" value={t.hours} />
      <Cell label="Min" value={t.minutes} />
      <Cell label="Sec" value={t.seconds} />
    </div>
  )
}
