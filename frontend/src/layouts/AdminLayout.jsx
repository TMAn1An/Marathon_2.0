import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/participants', label: 'Participants' },
  { to: '/admin/notifications', label: 'Notifications' },
  { to: '/admin/sponsors', label: 'Sponsors' },
  { to: '/admin/volunteers', label: 'Volunteers' },
]

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth()
  const navigate = useNavigate()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  const onLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-brand-900 text-slate-200 lg:flex">
        <Link to="/admin" className="px-6 py-5 text-white">
          <span className="block text-xs uppercase tracking-wider text-accent-300">IUBAT</span>
          <span className="block text-lg font-semibold">Marathon Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent-400 text-brand-900'
                    : 'text-slate-300 hover:bg-brand-900 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 text-xs text-slate-400 border-t border-brand-900">
          <p className="text-slate-200 font-medium">{admin?.name}</p>
          <p>{admin?.email}</p>
          <button onClick={onLogout} className="mt-3 inline-flex items-center gap-2 text-accent-300 hover:text-accent-200">
            ⎋ Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Admin</p>
              <h2 className="text-lg font-semibold text-brand-900">IUBAT CSE 10K Dashboard</h2>
            </div>
            <Link to="/" className="text-sm text-brand-700 hover:underline">View public site →</Link>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
