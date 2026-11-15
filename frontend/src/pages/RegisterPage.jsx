import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SlotMeter from '../components/SlotMeter'
import { registrationApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'
import { useEvent } from '../context/EventContext'
import { formatCurrency } from '../utils/format'
import Alert from '../components/Alert'

const tShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const initial = {
  full_name: '',
  id_number: '',
  category: '',
  phone: '',
  email: '',
  emergency_contact: '',
  tshirt_size: 'M',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { event, holdMinutes, categories } = useEvent()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (form.full_name.trim().length < 3) e.full_name = 'Please enter your full name.'
    if (!/^\+?[0-9 -]{7,18}$/.test(form.phone)) e.phone = 'Please enter a valid phone number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Please enter a valid email.'
    if (!/^\+?[0-9 -]{7,18}$/.test(form.emergency_contact)) e.emergency_contact = 'Please enter a valid emergency contact number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await registrationApi.register({ ...form, category: form.category || categories[0]?.id })
      const participant = data?.data?.participant
      const fee = data?.data?.fee
      const state = { participant, fee, holdExpiresAt: data?.data?.hold_expires_at }
      try { sessionStorage.setItem('marathon-checkout', JSON.stringify(state)) } catch { /* private mode */ }
      navigate('/payment', { state })
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl">Register</h1>
      <p className="mt-3 text-slate-600">
        Reserve your slot. Once you submit this form, your slot is held for {holdMinutes}&nbsp;minutes while
        you complete payment.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="card p-6 space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="full_name">Full name</label>
                <input id="full_name" name="full_name" autoComplete="name" required value={form.full_name} onChange={onChange}
                  className="input" placeholder="Your name as on ID" />
                {errors.full_name && <p className="mt-1 text-xs text-rose-600">{errors.full_name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="id_number">ID number <span className="font-normal text-brand-500">(optional)</span></label>
                <input id="id_number" name="id_number" value={form.id_number} onChange={onChange}
                  className="input" placeholder="Student, club or member ID" />
                {errors.id_number && <p className="mt-1 text-xs text-rose-600">{errors.id_number}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category || categories[0]?.id || ''} onChange={onChange} className="input">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.label} — {formatCurrency(c.fee)}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="tshirt_size">T-shirt size</label>
                <select id="tshirt_size" name="tshirt_size" value={form.tshirt_size} onChange={onChange} className="input">
                  {tShirtSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={onChange}
                  className="input" placeholder="+8801XXXXXXXXX" />
                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={onChange}
                  className="input" placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="emergency_contact">Emergency contact (number)</label>
              <input id="emergency_contact" name="emergency_contact" type="tel" inputMode="tel" required value={form.emergency_contact} onChange={onChange}
                className="input" placeholder="Phone of a parent or guardian" />
              {errors.emergency_contact && <p className="mt-1 text-xs text-rose-600">{errors.emergency_contact}</p>}
            </div>

            <Alert>{error}</Alert>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Your slot will be held for {holdMinutes} minutes after submission.</p>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Reserving…' : 'Reserve my slot'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <SlotMeter />
          <div className="card mt-4 p-5 text-sm text-slate-600">
            <h3 className="text-base">Need help?</h3>
            <p className="mt-2">
              Email <a className="text-brand-700 underline" href={`mailto:${event.support_email}`}>{event.support_email}</a> if
              you run into any issues during registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
