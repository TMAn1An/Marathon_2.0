import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { to: '/about', label: 'About' },
  { to: '/route', label: 'Route' },
  { to: '/registration-info', label: 'Info' },
  { to: '/results', label: 'Results' },
  { to: '/certificate', label: 'Certificate' },
  { to: '/faq', label: 'FAQ' },
]

const linkClass = ({ isActive }) =>
  `rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? 'bg-brand-950 text-white' : 'text-brand-700 hover:bg-brand-900/5 hover:text-brand-950'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  return (
    <header className="sticky top-3 z-40 px-3">
      <div className="mx-auto max-w-6xl rounded-full bg-white/95 px-3 py-2 shadow-lift ring-1 ring-brand-900/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 pl-2">
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link to="/register" className="btn-primary !px-5 !py-2">
              Register
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-900/5 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" aria-label="Mobile" className="mt-2 grid gap-1 border-t border-brand-900/10 px-1 pb-2 pt-3 lg:hidden">
            {[{ to: '/', label: 'Home' }, ...links, { to: '/sponsors', label: 'Sponsors' }, { to: '/organizers', label: 'Organizers' }].map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) =>
                `rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-950 text-white' : 'text-brand-700 hover:bg-brand-900/5'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
