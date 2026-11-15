import { useEvent } from '../context/EventContext'

const buildFaqs = ({ holdMinutes, event }) => [
  {
    q: 'Who can take part?',
    a: 'Anyone who registers and pays for a slot. Pick the category that fits you when you register. Bring photo ID on race day.',
  },
  {
    q: 'How do I pick up my BIB?',
    a: `Your BIB number is emailed once your payment is confirmed. Collection details are sent before race day by the organizers (${event.organizer || 'the organizing team'}).`,
  },
  {
    q: 'What happens if I miss my payment window?',
    a: `Slots are held for ${holdMinutes} minutes after registration. If you have not submitted your payment in that window the slot is released and you must register again. Once you submit a transaction ID the slot is held while an organizer verifies it.`,
  },
  {
    q: 'Can I get a refund?',
    a: 'Refund and transfer rules are set by the organizers. Contact them using the email below.',
  },
  {
    q: 'How are results published?',
    a: 'Finishing times appear on the Results page after the race.',
  },
  {
    q: 'Where do I download my finisher certificate?',
    a: 'After results are published, open the Certificate page, enter your BIB and registered phone number, and download your PDF.',
  },
]

export default function FaqPage() {
  const { event, holdMinutes } = useEvent()
  const faqs = buildFaqs({ holdMinutes, event })

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl">Frequently asked questions</h1>
      {event.support_email && (
        <p className="mt-3 text-brand-600">
          Don&rsquo;t see your question here? Email{' '}
          <a href={`mailto:${event.support_email}`} className="font-medium text-brand-800 underline">{event.support_email}</a>.
        </p>
      )}

      <div className="mt-8 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold text-brand-950">
              {f.q}
              <span className="ml-2 text-brand-400 transition-transform group-open:rotate-180" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 leading-relaxed text-brand-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
