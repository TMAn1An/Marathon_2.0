import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '◧' },
  { to: '/admin/events', label: 'Events', icon: '⌘' },
  { to: '/admin/posts', label: 'News & posts', icon: '✎' },
  { to: '/admin/certificates', label: 'Certificates', icon: '◆' },
  { to: '/admin/sponsors', label: 'Sponsors', icon: '◊' },
  { to: '/admin/volunteers', label: 'Volunteers', icon: '◇' },
]

const SUPER_LINKS = [{ to: '/admin/admins', label: 'Admins', icon: '★' }]

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth()
  const navigate = useNavigate()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-400">Loading…</div>
  }
  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  const onLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const isSuper = admin.role === 'super_admin'
  const navLinks = isSuper ? [...LINKS, ...SUPER_LINKS] : LINKS

  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-ink-100 bg-white lg:flex">
        <Link to="/admin" className="flex items-center gap-3 px-6 py-5">
          <img src="https://placehold.co/96x96/ED1C24/ffffff?text=IUBAT&font=playfair" alt="IUBAT logo" className="h-9 w-9 rounded-lg ring-1 ring-ink-200" />
          <div className="leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600">IUBAT SCSE</div>
            <div className="font-display text-base font-bold text-ink-900">Admin console</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                }`
              }
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 px-5 py-4 text-xs">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">Signed in</div>
          <div className="mt-1 font-display text-sm font-semibold text-ink-900">{admin.name}</div>
          <div className="text-ink-500">{admin.email}</div>
          {isSuper && <span className="mt-2 inline-flex pill-brand">Super admin</span>}
          <button onClick={onLogout} className="mt-3 block text-xs font-semibold text-brand-600 hover:text-brand-700">
            Sign out →
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Admin</p>
              <h2 className="font-display text-lg font-bold text-ink-900">IUBAT SCSE MINI Marathon</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View public site →</Link>
          </div>
        </header>
        <main className="p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
