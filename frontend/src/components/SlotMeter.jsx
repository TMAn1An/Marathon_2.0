import { useEffect, useState } from 'react'
import { slotsApi } from '../api/endpoints'

/**
 * Live capacity widget.
 * variant="light" (default) card, "glass" for dark hero backgrounds.
 * `compact` renders a single-line pill.
 */
export default function SlotMeter({ refreshInterval = 15000, compact = false, variant = 'light' }) {
  const [slots, setSlots] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await slotsApi.current()
        if (active) setSlots(data?.data || null)
      } catch {
        // keep last known value
      }
    }
    load()
    const id = setInterval(load, refreshInterval)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [refreshInterval])

  const dark = variant === 'glass'

  if (!slots) {
    return <div className={`${compact ? 'h-10' : 'h-44'} animate-pulse rounded-2xl ${dark ? 'bg-white/10' : 'bg-brand-100'}`} aria-hidden />
  }

  const { total, used, available } = slots
  const percent = total ? Math.min(100, Math.round((used / total) * 100)) : 0
  const full = available <= 0
  const almost = !full && percent >= 80

  if (compact) {
    return (
      <p className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${dark ? 'bg-white/10 text-brand-100 ring-1 ring-white/15' : 'bg-white text-brand-800 shadow-soft'}`}>
        <span className="h-2 w-2 rounded-full bg-action-400" aria-hidden />
        <strong className="tabular-nums">{used}/{total}</strong> slots filled · {full ? 'sold out' : `${available} left`}
      </p>
    )
  }

  const R = 44
  const C = 2 * Math.PI * R

  return (
    <div className={dark ? 'glass p-6' : 'card p-6'}>
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={R} fill="none" strokeWidth="9" className={dark ? 'stroke-white/10' : 'stroke-brand-100'} />
            <circle
              cx="50" cy="50" r={R} fill="none" strokeWidth="9" strokeLinecap="round"
              className={dark ? 'stroke-action-400' : 'stroke-brand-800'}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - percent / 100)}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className={`font-display text-2xl font-extrabold tabular-nums leading-none ${dark ? 'text-white' : 'text-brand-950'}`}>{percent}%</div>
              <div className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${dark ? 'text-brand-300' : 'text-brand-500'}`}>filled</div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? 'text-brand-300' : 'text-brand-500'}`}>Live slots</p>
          <p className={`mt-1 font-display text-4xl font-extrabold tabular-nums leading-none ${dark ? 'text-white' : 'text-brand-950'}`}>
            {full ? 'Full' : available}
          </p>
          <p className={`mt-1 text-sm ${dark ? 'text-brand-200' : 'text-brand-600'}`}>
            {full ? 'All BIBs are taken' : `of ${total} remaining`}
          </p>
          {almost && <span className="badge-amber mt-3">Almost full</span>}
        </div>
      </div>
      <div className="sr-only" role="progressbar" aria-label="Slots filled" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} />
    </div>
  )
}
