import { useCountdown } from '../hooks/useCountdown'

export default function CountdownClock({ target, className = '', tone = 'light' }) {
  const t = useCountdown(target)
  const isDark = tone === 'dark'
  const cellBg = isDark ? 'bg-white/10 ring-1 ring-white/20 text-white' : 'bg-ink-50 ring-1 ring-ink-100 text-ink-900'
  const numCls = isDark ? 'text-white' : 'text-ink-900'
  const labelCls = isDark ? 'text-white/70' : 'text-ink-500'

  if (!t) {
    return <div className={`text-sm ${labelCls}`}>—</div>
  }

  const items = [
    { label: 'Days', value: t.days },
    { label: 'Hours', value: t.hours },
    { label: 'Minutes', value: t.minutes },
    { label: 'Seconds', value: t.seconds },
  ]

  return (
    <div className={`grid grid-cols-4 gap-2 sm:gap-3 ${className}`}>
      {items.map((it) => (
        <div key={it.label} className={`rounded-xl ${cellBg} px-2 py-3 text-center sm:px-4`}>
          <div className={`font-display text-2xl font-bold tabular-nums sm:text-3xl ${numCls}`}>
            {String(it.value).padStart(2, '0')}
          </div>
          <div className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${labelCls}`}>
            {it.label}
          </div>
        </div>
      ))}
    </div>
  )
}
