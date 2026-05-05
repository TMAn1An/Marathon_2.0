import { useEffect, useState } from 'react'
import { eventApi } from '../api/endpoints'
import SafeImage from '../components/SafeImage'

export default function OrganizersPage() {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventApi.volunteers()
      .then(({ data }) => setVolunteers(data?.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <span className="badge-orange">Behind the race</span>
      <h1 className="mt-3 text-4xl">Organizers &amp; volunteers</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        The marathon is organised by faculty, students and volunteers from the IUBAT CSE Department.
        Want to join the volunteer team? Email <a href="mailto:marathon@iubat.edu" className="text-brand-700 underline">marathon@iubat.edu</a>.
      </p>

      {loading ? (
        <p className="mt-10 text-slate-500">Loading…</p>
      ) : volunteers.length === 0 ? (
        <p className="mt-10 text-slate-500">Volunteer roster will be published closer to the event.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {volunteers.map((v) => (
            <article
              key={v.id}
              className="group card p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Circular avatar — equal size for everyone, centered face,
                  soft shadow + green ring for premium look. */}
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-brand-100 shadow-soft transition group-hover:ring-brand-200">
                <SafeImage
                  src={v.photo_url}
                  alt={`${v.name} portrait`}
                  width={300}
                  height={300}
                  fallbackText={v.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 text-base">{v.name}</h3>
              <p className="text-sm font-medium text-brand-700">{v.role}</p>
              {v.bio && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {v.bio}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
