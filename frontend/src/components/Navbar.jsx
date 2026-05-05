import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/route', label: 'Route Map' },
  { to: '/registration-info', label: 'Registration' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/organizers', label: 'Organizers' },
  { to: '/faq', label: 'FAQ' },
  { to: '/results', label: 'Results' },
  { to: '/certificate', label: 'Certificate' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-900 text-accent-400 font-bold">
            10K
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-brand-900">IUBAT CSE</span>
            <span className="block text-xs text-slate-500">10K Marathon</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/register" className="btn-primary">Register Now</Link>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-md p-2 text-slate-600 hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M3 5h14v2H3zM3 9h14v2H3zM3 13h14v2H3z"/></svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full mt-2">
            Register Now
          </Link>
        </div>
      )}
    </header>
  )
}
