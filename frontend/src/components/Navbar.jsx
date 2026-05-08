import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/news', label: 'News' },
  { to: '/certificate', label: 'Certificate' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled ? 'glass-nav border-b border-ink-200/70 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/brand/icmm-2026.jpg"
            alt="ICMM 2026 — IUBAT SCSE MINI Marathon"
            className="h-11 w-auto rounded-md object-contain"
            loading="eager"
          />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              IUBAT SCSE
            </span>
            <span className="font-display text-base font-bold text-ink-900">MINI Marathon</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'text-crimson-700'
                    : 'text-ink-700 hover:text-ink-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-brand-50"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/events" className="btn-primary">Register</Link>
          <img
            src="/brand/iubat-logo.png"
            alt="IUBAT logo"
            className="h-11 w-auto object-contain"
            loading="eager"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-ink-200 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-ink-900 transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-ink-900 transition ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-ink-900 transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100 lg:hidden">
          <ul className="grid gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-crimson-700' : 'text-ink-800 hover:bg-ink-50'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
            <li className="flex items-center gap-3 px-2 pt-3">
              <img src="/brand/iubat-logo.png" alt="IUBAT logo" className="h-9 w-auto object-contain" />
              <Link to="/events" className="btn-primary flex-1 justify-center">Register</Link>
            </li>
          </ul>
        </div>
      )}
    </motion.header>
  )
}
