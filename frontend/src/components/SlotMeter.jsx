import { useEffect, useState } from 'react'
import { slotsApi } from '../api/endpoints'

export default function SlotMeter({ refreshInterval = 15000, compact = false }) {
  const [slots, setSlots] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await slotsApi.current()
        if (active) setSlots(data?.data || null)
      } catch {
        // ignore — we'll show fallback below
      }
    }
    load()
    const id = setInterval(load, refreshInterval)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [refreshInterval])

  const total = slots?.total ?? 400
  const used = slots?.used ?? 0
  const available = slots?.available ?? total
  const percent = Math.min(100, Math.round((used / total) * 100))

  if (compact) {
    return (
      <div className="rounded-lg bg-white px-4 py-2 shadow-soft text-sm text-slate-700">
        <span className="font-semibold text-brand-900">{used}/{total}</span>{' '}
        slots filled · <span className="text-emerald-600 font-medium">{available} left</span>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-brand-900">Live slot count</h3>
        <span className="text-xs text-slate-500">Refreshes automatically</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-brand-900">{used}</span>
        <span className="text-sm text-slate-500">/ {total} slots</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-action-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-500">{percent}% full</span>
        <span className="font-medium text-emerald-600">{available} spots remaining</span>
      </div>
    </div>
  )
}
