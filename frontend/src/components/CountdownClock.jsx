import { useCountdown } from '../hooks/useCountdown'

function Cell({ label, value }) {
  return (
    <div className="glass flex-1 px-2 py-3 text-center sm:px-4 sm:py-4">
      <div className="font-display text-3xl font-extrabold tabular-nums leading-none text-white sm:text-4xl">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-300">{label}</div>
    </div>
  )
}

export default function CountdownClock({ targetDate }) {
  const t = useCountdown(targetDate)
  if (!t) return null

  if (t.expired) {
    return (
      <div className="inline-flex rounded-full bg-action-400 px-5 py-2.5 text-sm font-bold text-brand-950">
        Race day is here!
      </div>
    )
  }

  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Time until race day">
      <Cell label="Days" value={t.days} />
      <Cell label="Hours" value={t.hours} />
      <Cell label="Min" value={t.minutes} />
      <Cell label="Sec" value={t.seconds} />
    </div>
  )
}
