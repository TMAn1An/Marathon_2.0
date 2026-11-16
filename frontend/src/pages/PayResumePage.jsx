import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { registrationApi } from '../api/endpoints'
import Spinner from '../components/Spinner'

/** Landing page for the "pay again" link in the payment-rejected email. */
export default function PayResumePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ phase: 'loading' })

  useEffect(() => {
    let active = true
    registrationApi.resume(token)
      .then(({ data }) => {
        if (!active) return
        const d = data.data
        if (d.participant.status === 'confirmed') {
          setState({ phase: 'confirmed', bib: d.participant.bib_number })
        } else if (d.can_pay) {
          const checkout = { participant: d.participant, fee: d.fee, holdExpiresAt: d.hold_expires_at }
          try { sessionStorage.setItem('marathon-checkout', JSON.stringify(checkout)) } catch { /* private mode */ }
          navigate('/payment', { replace: true, state: checkout })
        } else {
          setState({ phase: 'expired' })
        }
      })
      .catch(() => active && setState({ phase: 'missing' }))
    return () => { active = false }
  }, [token, navigate])

  if (state.phase === 'loading') return <Spinner label="Loading your registration…" />

  const copy = {
    confirmed: { title: 'You are already confirmed', body: `Your BIB number is ${state.bib}. Nothing more to pay.`, cta: ['/', 'Back to home'] },
    expired: { title: 'This reservation has expired', body: 'The slot hold ran out. Register again to get a new slot while places remain.', cta: ['/register', 'Register again'] },
    missing: { title: 'We could not find that registration', body: 'The link may be incomplete. Open it again from your email.', cta: ['/register', 'Go to registration'] },
  }[state.phase]

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl">{copy.title}</h1>
      <p className="mt-3 text-brand-600">{copy.body}</p>
      <Link to={copy.cta[0]} className="btn-primary mt-8 inline-flex">{copy.cta[1]}</Link>
    </div>
  )
}
