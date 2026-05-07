import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { sponsorsApi, volunteersApi } from '../api/endpoints'
import { Section, fadeUp, staggerContainer } from '../components/Section'
import SafeImage from '../components/SafeImage'
import SponsorMarquee from '../components/SponsorMarquee'

const ORGANIZERS = [
  { name: 'Prof. Dr. Hasanul Karim', role: 'Director, SCSE', bio: 'Leads the platform programme and academic alignment.', img: 'https://i.pravatar.cc/300?img=58' },
  { name: 'Prof. Mahmuda Rahman', role: 'Faculty advisor', bio: 'Curriculum partner — connects events to coursework.', img: 'https://i.pravatar.cc/300?img=49' },
  { name: 'Mr. Tanvir Iqbal', role: 'Programme manager', bio: 'Owns logistics, vendors, and on-the-day operations.', img: 'https://i.pravatar.cc/300?img=33' },
  { name: 'MD MAINUL ISLAM', role: 'Platform engineer', bio: 'Designed and built the multi-event platform.', img: 'https://i.pravatar.cc/300?img=12' },
]

export default function AboutPage() {
  const [sponsors, setSponsors] = useState([])
  const [volunteers, setVolunteers] = useState([])

  useEffect(() => {
    sponsorsApi.list().then((res) => setSponsors(res.data?.data || [])).catch(() => {})
    volunteersApi.list().then((res) => setVolunteers(res.data?.data || [])).catch(() => {})
  }, [])

  return (
    <>
      <header className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <span className="pill bg-white/10 text-white">About the platform</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            A modern, multi-event running engine for IUBAT SCSE.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/75">
            From a single 5K idea, we built a platform: every IUBAT SCSE run lives here, with chip timing, instant
            certificates, role-gated admin tools and a CMS for live announcements.
          </p>
        </div>
      </header>

      <Section
        id="organizers"
        eyebrow="Organisers"
        title="The team behind the start gun"
        intro="Faculty leadership and student volunteers who keep race-day humming."
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ORGANIZERS.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              className="group rounded-3xl bg-white p-6 text-center ring-1 ring-ink-100 transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-brand-50 shadow-soft">
                <SafeImage src={p.img} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{p.name}</h3>
              <div className="mt-1 text-xs uppercase tracking-widest text-brand-600">{p.role}</div>
              <p className="mt-3 text-sm text-ink-600">{p.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section
        id="volunteers"
        eyebrow="Volunteers"
        title="The campus crew"
        intro="Students from across IUBAT keep the corridors, hydration stations and finish line buzzing."
      >
        {volunteers.length === 0 ? (
          <p className="text-center text-sm text-ink-500">Volunteer listings open closer to race-day.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {volunteers.map((v) => (
              <div key={v.id} className="rounded-3xl bg-white p-6 text-center ring-1 ring-ink-100">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-full ring-4 ring-brand-50 shadow-soft">
                  <SafeImage
                    src={v.photo_url || `https://i.pravatar.cc/300?u=${v.id}`}
                    alt={v.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 font-display text-base font-semibold text-ink-900">{v.name}</div>
                <div className="text-xs uppercase tracking-widest text-brand-600">{v.role}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="sponsors"
        eyebrow="Sponsors"
        title="The brands powering campus running"
        intro="A grateful nod to the sponsors who back our programme."
      >
        <SponsorMarquee sponsors={sponsors} />
      </Section>
    </>
  )
}
