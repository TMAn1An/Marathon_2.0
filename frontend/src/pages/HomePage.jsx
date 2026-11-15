import { Link } from 'react-router-dom'
import CountdownClock from '../components/CountdownClock'
import SlotMeter from '../components/SlotMeter'
import SponsorMarquee from '../components/SponsorMarquee'
import { useEvent } from '../context/EventContext'
import { formatCurrency, formatDate } from '../utils/format'

const benefits = [
  {
    title: 'Official BIB & timing chip',
    body: 'Custom-printed bib with embedded timing — every second of your run is recorded.',
    icon: (
      <path d="M5 4h14a1 1 0 011 1v3l-2 4 2 4v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3l2-4-2-4V5a1 1 0 011-1zm2 4h10V6H7v2zm0 10h10v-2H7v2z" />
    ),
  },
  {
    title: 'Race t-shirt',
    body: 'A performance tee picked up at race-pack collection.',
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
    body: 'A finisher medal handed out at the finish line to everyone who crosses it.',
    icon: (
      <path d="M12 14l-4 6 1-3-3 1 6-4zm0 0l4 6-1-3 3 1-6-4zm0-12a5 5 0 110 10 5 5 0 010-10z" />
    ),
  },
  {
    title: 'Post-race refreshments',
    body: 'Refuel with hot food and drinks at the finish-line refreshment zone.',
    icon: (
      <path d="M4 19h16v2H4v-2zm0-2v-1c0-3.3 3.6-6 8-6s8 2.7 8 6v1H4zm14-9a3 3 0 110-6 3 3 0 010 6z" />
    ),
  },
]

const steps = (holdMinutes) => [
  { title: 'Reserve', body: `Fill in the form and your slot is held for ${holdMinutes} minutes.` },
  { title: 'Pay', body: 'Send the fee by bKash or Nagad and submit your TrxID. An organizer verifies it.' },
  { title: 'Run', body: 'Your BIB arrives by email. After the race, download your certificate with your BIB and phone.' },
]

const spans = ['lg:col-span-4', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3']

export default function HomePage() {
  const { event, categories, slots, holdMinutes, distance } = useEvent()
  const total = slots?.total

  return (
    <div>
      {/* HERO */}
      <section className="hero-bg relative overflow-hidden pb-24 pt-36 text-white lg:pt-44">
        <span aria-hidden className="text-outline pointer-events-none absolute -right-6 top-24 select-none font-display text-[22rem] font-extrabold leading-none opacity-[0.12] max-lg:hidden">
          {distance}K
        </span>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-100 ring-1 ring-white/15">
              <span className="h-2 w-2 animate-pulse rounded-full bg-action-400 motion-reduce:animate-none" aria-hidden />
              {formatDate(event.date, { dateStyle: 'long' })} · {event.venue}
            </p>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Run <span className="text-outline">{distance}K</span>
              <br />
              together.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-200">
              {event.tagline || `Join the ${event.name}.`}
              {total ? <> Just <strong className="text-white">{total} BIBs</strong> are up for grabs.</> : null}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/register" className="btn-cta">Register now</Link>
              <Link to="/registration-info" className="btn-ghost !px-8 !py-3.5 text-base">How it works</Link>
            </div>
          </div>

          <div className="grid gap-4">
            <CountdownClock targetDate={event.date} />
            <SlotMeter variant="glass" />
          </div>
        </div>
      </section>

      {/* FACT STRIP */}
      <section aria-label="Race facts" className="bg-action-400 text-brand-950">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-4 px-6 py-6 text-center md:grid-cols-4 md:text-left">
          {[
            ['Distance', `${distance} kilometres`],
            ['Race day', formatDate(event.date, { dateStyle: 'medium' })],
            ['Venue', event.venue],
            ['Categories', categories.map((c) => c.label).join(' · ') || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{k}</dt>
              <dd className="mt-0.5 font-display text-lg font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* WHAT YOU GET: bento */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal max-w-2xl">
          <span className="eyebrow">Race pack</span>
          <h2 className="mt-4 text-4xl md:text-5xl">Everything on race day, sorted.</h2>
          <p className="mt-4 text-lg text-brand-600">Every confirmed registration includes the full experience.</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          {benefits.map((b, i) => {
            const feature = i === 0
            return (
              <article key={b.title}
                className={`reveal group relative overflow-hidden rounded-3xl p-7 transition duration-300 hover:-translate-y-1 ${spans[i]} ${
                  feature ? 'card-dark !rounded-3xl hero-bg min-h-[16rem]' : 'card !rounded-3xl hover:shadow-lift'
                }`}>
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${feature ? 'bg-action-400 text-brand-950' : 'bg-brand-950 text-action-400'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>{b.icon}</svg>
                </div>
                <h3 className={`mt-5 text-xl ${feature ? '!text-white' : ''}`}>{b.title}</h3>
                <p className={`mt-2 max-w-md text-sm leading-relaxed ${feature ? 'text-brand-200' : 'text-brand-600'}`}>{b.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 text-4xl md:text-5xl">Three steps to the start line.</h2>
          </div>
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {steps(holdMinutes).map((st, i) => (
              <li key={st.title} className="reveal relative">
                <span className="font-display text-7xl font-extrabold leading-none text-brand-100" aria-hidden>0{i + 1}</span>
                <h3 className="-mt-3 text-2xl">{st.title}</h3>
                <p className="mt-2 leading-relaxed text-brand-600">{st.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="hero-bg py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="reveal max-w-xl text-4xl !text-white md:text-5xl">The race in numbers.</h2>
          <dl className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Distance', String(distance), 'km'],
              ['Runner capacity', total ?? '—', ''],
              ...categories.slice(0, 2).map((c) => [`${c.label} fee`, formatCurrency(c.fee), '']),
            ].map(([label, value, unit]) => (
              <div key={label} className="reveal bg-brand-950 p-8">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{label}</dt>
                <dd className="mt-3 font-display text-5xl font-extrabold tabular-nums text-action-400">
                  {value}<span className="ml-1 text-2xl text-brand-300">{unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SponsorMarquee />

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-4">
        <div className="reveal relative overflow-hidden rounded-4xl bg-action-400 px-8 py-16 text-center md:px-16">
          <span aria-hidden className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 select-none font-display text-[16rem] font-extrabold leading-none text-brand-950/[0.06]">{distance}K</span>
          <h2 className="relative mx-auto max-w-2xl text-4xl text-brand-950 md:text-5xl">
            Lace up. Your slot won&rsquo;t wait forever.
          </h2>
          <div className="relative mt-6 flex justify-center"><SlotMeter compact /></div>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-cta !bg-brand-950 !text-white hover:!bg-brand-800">Register now</Link>
            <Link to="/faq" className="btn-outline !border-brand-950/30 !text-brand-950 hover:!bg-brand-950 hover:!text-white !px-8 !py-3.5 text-base">Read the FAQ</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
