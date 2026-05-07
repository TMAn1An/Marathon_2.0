import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative border-t border-ink-200 bg-ink-950 text-ink-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="https://placehold.co/96x96/ED1C24/ffffff?text=IUBAT&font=playfair"
              alt="IUBAT logo"
              className="h-10 w-10 rounded-lg"
              loading="lazy"
            />
            <img
              src="https://placehold.co/96x96/ffffff/0f1118?text=SCSE"
              alt="School of CSE logo"
              className="h-10 w-10 rounded-lg"
              loading="lazy"
            />
            <span className="font-display text-lg font-bold text-white">IUBAT SCSE MINI Marathon</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">
            A multi-event running platform built and operated by the IUBAT School of Computer Science &amp;
            Engineering. Run with knowledge, finish with pride.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {['facebook', 'instagram', 'youtube', 'linkedin'].map((s) => (
              <a
                key={s}
                href={`https://${s}.com`}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-xs uppercase text-ink-300 ring-1 ring-white/10 transition hover:bg-brand-500 hover:text-white"
              >
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-300">
            <li><Link to="/events" className="hover:text-white">Events</Link></li>
            <li><Link to="/news" className="hover:text-white">News &amp; updates</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link to="/certificate" className="hover:text-white">Certificates</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Programme</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-300">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/about#sponsors" className="hover:text-white">Sponsors</Link></li>
            <li><Link to="/about#organizers" className="hover:text-white">Organizers</Link></li>
            <li><Link to="/about#volunteers" className="hover:text-white">Volunteers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-300">
            <li>IUBAT, Sector 10, Uttara</li>
            <li>Dhaka, Bangladesh</li>
            <li>marathon@iubat.edu</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ink-400 sm:flex-row lg:px-8">
          <span>© {new Date().getFullYear()} IUBAT SCSE MINI Marathon. All rights reserved.</span>
          <span>Built by the SCSE platform team.</span>
        </div>
      </div>
    </footer>
  )
}
