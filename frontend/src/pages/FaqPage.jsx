import { useEvent } from '../context/EventContext'

const buildFaqs = (holdMinutes) => [
  {
    q: 'Who can participate?',
    a: 'Any current IUBAT student or faculty member. You will need to provide your university ID at registration and on race day.',
  },
  {
    q: 'How do I pick up my BIB?',
    a: 'BIB collection happens at the IUBAT campus the day before the race. Show your government ID and registration confirmation.',
  },
  {
    q: 'What happens if I miss my payment window?',
    a: `Slots are held for ${holdMinutes} minutes after registration. If payment is not completed in that window the slot is released and you must register again.`,
  },
  {
    q: 'Can I get a refund?',
    a: 'Registration fees are non-refundable but transferable to another runner up to 7 days before the event.',
  },
  {
    q: 'Is the course timed?',
    a: 'Yes. Each BIB has a chip and gross + net times will be published online after the event.',
  },
  {
    q: 'Where do I download my finisher certificate?',
    a: 'After the race, head to the Certificate page, enter your BIB and registered phone number, and download your PDF certificate.',
  },
]

export default function FaqPage() {
  const { event, holdMinutes } = useEvent()
  const faqs = buildFaqs(holdMinutes)
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl">Frequently asked questions</h1>
      <p className="mt-3 text-slate-600">
        Don't see your question here? Email us at <a href={`mailto:${event.support_email}`} className="text-brand-700 underline">{event.support_email}</a>.
      </p>

      <div className="mt-8 divide-y divide-slate-200 rounded-xl bg-white shadow-soft">
        {faqs.map((f, i) => (
          <details key={i} className="group p-5">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-brand-900">
              {f.q}
              <span className="ml-2 transition-transform group-open:rotate-180 text-slate-400">▾</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
