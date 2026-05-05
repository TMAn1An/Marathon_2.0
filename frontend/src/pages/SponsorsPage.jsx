import { useEffect, useState } from 'react'
import { eventApi } from '../api/endpoints'
import SafeImage from '../components/SafeImage'

const tierLabel = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  partner: 'Community partner',
}

const tierBadgeClass = {
  platinum: 'badge-slate',
  gold: 'badge-amber',
  silver: 'badge-slate',
  bronze: 'badge-orange',
  partner: 'badge-green',
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventApi.sponsors()
      .then(({ data }) => setSponsors(data?.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <span className="badge-orange">Partners</span>
      <h1 className="mt-3 text-4xl">Sponsors &amp; partners</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        We are grateful to the organizations that make the IUBAT CSE 10K Marathon possible.
        Want to partner with us next year? Email <a className="text-brand-700 underline" href="mailto:marathon@iubat.edu">marathon@iubat.edu</a>.
      </p>

      {loading ? (
        <p className="mt-10 text-slate-500">Loading sponsors…</p>
      ) : sponsors.length === 0 ? (
        <p className="mt-10 text-slate-500">Sponsorship slots are still open. Email marathon@iubat.edu to partner with us.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((s) => (
            <div key={s.id} className="card p-6 flex flex-col">
              <div className="flex h-28 items-center justify-center rounded-lg bg-brand-50 px-6">
                <SafeImage
                  src={s.logo_url}
                  alt={`${s.name} logo`}
                  width={240}
                  height={80}
                  fallbackText={s.name}
                  className="h-14 w-auto object-contain"
                />
              </div>
              <span className={`mt-4 self-start uppercase tracking-wide text-[10px] ${tierBadgeClass[s.tier] || 'badge-slate'}`}>
                {tierLabel[s.tier] || s.tier}
              </span>
              <h3 className="mt-2 text-lg">{s.name}</h3>
              {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}
              {s.website && (
                <a href={s.website} target="_blank" rel="noreferrer"
                  className="mt-auto pt-4 text-sm font-medium text-brand-700 hover:underline">
                  Visit website →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
