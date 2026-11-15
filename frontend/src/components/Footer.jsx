import { Link } from 'react-router-dom'
import { useEvent } from '../context/EventContext'
import Logo from './Logo'

const columns = [
  {
    title: 'The race',
    links: [['/about', 'About'], ['/route', 'Route map'], ['/registration-info', 'Registration info'], ['/faq', 'FAQ']],
  },
  {
    title: 'After the race',
    links: [['/results', 'Results'], ['/certificate', 'Certificate'], ['/sponsors', 'Sponsors'], ['/organizers', 'Organizers']],
  },
]

export default function Footer() {
  const { event } = useEvent()
  const year = new Date().getFullYear()

  return (
    <footer className="hero-bg mt-24 text-brand-200">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-brand-300">
            {event.tagline || `Organised by ${event.organizer}.`}
          </p>
          <Link to="/register" className="btn-primary mt-6">Reserve your slot</Link>
        </div>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">{c.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([to, label]) => (
                <li key={to}><Link to={to} className="text-brand-200 transition-colors hover:text-action-300">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Contact</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-300">
            <li>{event.venue}</li>
            <li>
              <a href={`mailto:${event.support_email}`} className="text-brand-200 transition-colors hover:text-action-300">
                {event.support_email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-brand-400">
          <p>© {year} {event.organizer}</p>
          <Link to="/admin/login" className="transition-colors hover:text-action-300">Organizer sign in</Link>
        </div>
      </div>
    </footer>
  )
}
