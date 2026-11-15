import { Link } from 'react-router-dom'
import CountdownClock from '../components/CountdownClock'
import SlotMeter from '../components/SlotMeter'
import { useEvent } from '../context/EventContext'
import { formatCurrency, formatDate } from '../utils/format'
import SponsorMarquee from '../components/SponsorMarquee'

const benefits = [
  {
    title: 'Official BIB & timing chip',
    body: 'Custom-printed bib with embedded timing — every second of your run is recorded.',
    icon: (
      <path d="M5 4h14a1 1 0 011 1v3l-2 4 2 4v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3l2-4-2-4V5a1 1 0 011-1zm2 4h10V6H7v2zm0 10h10v-2H7v2z" />
    ),
  },
  {
    title: 'IUBAT race t-shirt',
    body: 'Premium dri-fit performance tee in IUBAT colours, picked up at race-pack collection.',
    icon: (
      <path d="M16 4l4 3-3 3-2-1v9a2 2 0 01-2 2H9a2 2 0 01-2-2V9L5 10 2 7l4-3 3 1h6l1-1z" />
    ),
  },
  {
    title: 'Finisher e-certificate',
    body: 'A QR-verified PDF certificate is issued automatically once your registration is paid.',
    icon: (
      <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1.5V9h5.5L14 3.5zM7 13h10v2H7v-2zm0 4h10v2H7v-2z" />
    ),
  },
  {
    title: 'Hydration & medical',
    body: 'Water + electrolyte stations every 2.5 km and on-course medical support throughout.',
    icon: (
      <path d="M12 2.5l-5 7.6a6 6 0 1010 0L12 2.5zm0 4.7l3.3 5a3.3 3.3 0 11-6.6 0L12 7.2z" />
    ),
  },
  {
    title: 'Finisher medal',
    body: 'A custom IUBAT 10K finisher medal handed out at the finish line for everyone who crosses.',
    icon: (
      <path d="M12 14l-4 6 1-3-3 1 6-4zm0 0l4 6-1-3 3 1-6-4zm0-12a5 5 0 110 10 5 5 0 010-10z" />
    ),
  },
  {
    title: 'Post-race breakfast',
    body: 'Refuel with a hot post-race breakfast and chai at the IUBAT Main Campus refreshment zone.',
    icon: (
      <path d="M4 19h16v2H4v-2zm0-2v-1c0-3.3 3.6-6 8-6s8 2.7 8 6v1H4zm14-9a3 3 0 110-6 3 3 0 010 6z" />
    ),
  },
]

export default function HomePage() {
  const { event, fees, slots, holdMinutes } = useEvent()
  const date = event.date
  const venue = event.venue
  const eventName = event.name
  const total = slots?.total

  return (
    <div>
      {/* ============================================================= */}
      {/* HERO — green background, orange CTA, all above the fold        */}
      {/* ============================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 82% 82%, rgba(249,96,21,0.35), transparent 45%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:py-20 grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <span className="badge-amber text-[11px]">
              {formatDate(date, { dateStyle: 'long' })} &nbsp;·&nbsp; {venue}
            </span>

            <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-white">
              Run with us.
              <br />
              <span className="text-accent-300">{eventName}</span>
            </h1>

            <p className="mt-4 max-w-xl text-base lg:text-lg text-brand-50/90">
              A community 10K hosted by the IUBAT Department of Computer Science &amp; Engineering.
              <strong className="text-white"> {total ?? 'Limited'} runners.</strong> One starting line. One finisher medal with your name on it.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="btn-cta">Register Now</Link>
              <Link to="/about" className="btn-ghost">View Details</Link>
            </div>

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-widest text-brand-100 mb-2">Race day countdown</p>
              <CountdownClock targetDate={date} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <SlotMeter />
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* TRUST STRIP — organised by IUBAT CSE                           */}
      {/* ============================================================= */}
      <section className="bg-white border-b border-brand-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-10">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
                Officially organised by
              </p>
              <p className="mt-1 text-lg font-semibold text-brand-900">
                IUBAT &middot; School of Computer Science &amp; Engineering
              </p>
              <p className="mt-1 text-sm text-slate-600 max-w-xl">
                Hosted on the IUBAT Main Campus and run by the CSE Department with the help of student and faculty volunteers.
              </p>
            </div>
            <Link to="/organizers" className="btn-outline md:justify-self-end">Meet the team</Link>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* WHAT YOU GET — icon-driven benefits grid                       */}
      {/* ============================================================= */}
      <section className="bg-brand-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <span className="badge-orange">Race-pack</span>
            <h2 className="mt-3 text-3xl md:text-4xl">What you get</h2>
            <p className="mt-2 text-slate-600">
              Every confirmed registration includes the full IUBAT race experience — gear, support, timing, finisher recognition.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="card p-6 hover:shadow-md transition">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-700 text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">{b.icon}</svg>
                </div>
                <h3 className="mt-4 text-lg">{b.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* AT A GLANCE — facts straight from the event configuration     */}
      {/* ============================================================= */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <span className="badge-amber">At a glance</span>
            <h2 className="mt-3 text-3xl md:text-4xl">Race day in numbers</h2>
          </div>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Distance', '10 KM'],
              ['Runner capacity', total ?? '—'],
              ['Student fee', formatCurrency(fees.student)],
              ['Faculty fee', formatCurrency(fees.faculty)],
            ].map(([label, value]) => (
              <div key={label} className="card p-5 text-center">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 text-3xl font-bold text-brand-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============================================================= */}
      {/* SPONSORS — large, prominent, auto-scrolling logo carousel      */}
      {/* ============================================================= */}
      <SponsorMarquee />

      {/* ============================================================= */}
      {/* URGENCY — slots + countdown + CTA                              */}
      {/* ============================================================= */}
      <section className="bg-brand-800 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 grid gap-8 lg:grid-cols-3 items-center">
          <div className="lg:col-span-2">
            <span className="badge-orange bg-action-500 text-white">Limited capacity</span>
            <h2 className="mt-3 text-3xl md:text-4xl text-white">{total ? `Only ${total} BIBs.` : 'Limited BIBs.'} Don&rsquo;t miss yours.</h2>
            <p className="mt-3 text-brand-50/90 max-w-2xl">
              Registration closes when the last slot is taken. Reserve a slot, finish payment, and your BIB is locked in.
            </p>

            <div className="mt-5">
              <SlotMeter compact />
            </div>

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-widest text-brand-100 mb-2">Race-day countdown</p>
              <CountdownClock targetDate={date} />
            </div>
          </div>

          <div className="text-center lg:text-right">
            <Link to="/register" className="btn-cta">Reserve my slot</Link>
            <p className="mt-3 text-xs text-brand-100/80">
              Slot is held for {holdMinutes} minutes while you complete payment.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* FINAL CTA — clean, centered                                    */}
      {/* ============================================================= */}
      <section className="bg-brand-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl">
            Don&rsquo;t miss your chance to be part of the {eventName}.
          </h2>
          <p className="mt-4 text-slate-600">
            Lace up. Show up. Run with the CSE department, your batch and hundreds of new friends — all on one morning.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-cta">Register Now</Link>
            <Link to="/registration-info" className="btn-outline">Read the rules</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
