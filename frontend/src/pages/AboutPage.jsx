import { useEvent } from '../context/EventContext'

export default function AboutPage() {
  const { event, totalSlots, categories, distance } = useEvent()

  const cards = [
    {
      title: 'Our mission',
      body: 'Encourage healthy living and grassroots running, and make race day a celebration the whole community can share.',
    },
    {
      title: 'Race format',
      body: `One distance: ${distance} km. ${categories.length > 1 ? `Categories: ${categories.map((c) => c.label).join(', ')}.` : ''} ${totalSlots ? `Capped at ${totalSlots} runners so everyone gets full on-course support.` : ''}`,
    },
    {
      title: 'Where it happens',
      body: `The race takes place at ${event.venue || 'the event venue'}. See the route page for the course map.`,
    },
    {
      title: 'Inclusive by design',
      body: 'Walkers and first-timers are welcome. Run it, jog it or walk it at your own pace.',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl">About the event</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-brand-600">
        {event.tagline || `The ${event.name} is a community run.`} It is organised by {event.organizer || 'a team of volunteers'}.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="card p-6">
            <h3 className="text-lg">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-600">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
