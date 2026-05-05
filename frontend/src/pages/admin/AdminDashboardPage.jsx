import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { formatCurrency } from '../../utils/format'

function StatCard({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    adminApi.dashboard()
      .then(({ data }) => active && setStats(data?.data))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-slate-500">Loading dashboard…</p>
  if (!stats) return <p className="text-rose-600">Could not load dashboard data.</p>

  const slots = stats.slots
  const p = stats.participants
  const pay = stats.payments

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Slot usage" value={`${slots.used}/${slots.total}`} hint={`${slots.available} remaining`} />
        <StatCard label="Confirmed" value={p.confirmed} hint={`Students ${p.by_category.student} · Faculty ${p.by_category.faculty}`} />
        <StatCard label="Pending" value={p.pending} hint="In registration / payment funnel" />
        <StatCard label="Cancelled" value={p.cancelled} hint="Slot reservations released" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Completed payments" value={pay.completed_count} hint={formatCurrency(pay.completed_amount)} />
        <StatCard label="Pending payments" value={pay.pending_count} hint="Awaiting confirmation" />
        <StatCard label="Failed payments" value={pay.failed_count} hint="Hold released back to pool" />
      </div>

      <div className="card p-5">
        <h3 className="text-lg">Slot capacity</h3>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-accent-400" style={{ width: `${Math.min(100, Math.round((slots.used / slots.total) * 100))}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {slots.used} of {slots.total} slots taken ({slots.available} still available).
        </p>
      </div>
    </div>
  )
}
