import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SlotMeter from '../components/SlotMeter'
import { registrationApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'

const tShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const initial = {
  full_name: '',
  university_id: '',
  category: 'student',
  phone: '',
  email: '',
  emergency_contact: '',
  tshirt_size: 'M',
}

export default function RegisterPage() {
  const navigate = useNavigate()
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
    if (!form.university_id) e.university_id = 'University ID is required.'
    if (!/^\+?[0-9 -]{7,20}$/.test(form.phone)) e.phone = 'Please enter a valid phone number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Please enter a valid email.'
    if (!/^\+?[0-9 -]{7,20}$/.test(form.emergency_contact)) e.emergency_contact = 'Please enter a valid emergency contact number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await registrationApi.register(form)
      const participant = data?.data?.participant
      const fee = data?.data?.fee
      navigate('/payment', { state: { participant, fee, holdExpiresAt: data?.data?.hold_expires_at } })
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
        Reserve your slot. Once you submit this form, your slot is held for 10&nbsp;minutes while
        you complete payment.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="card p-6 space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="full_name">Full name</label>
                <input id="full_name" name="full_name" value={form.full_name} onChange={onChange}
                  className="input" placeholder="Your name as on ID" />
                {errors.full_name && <p className="mt-1 text-xs text-rose-600">{errors.full_name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="university_id">University ID</label>
                <input id="university_id" name="university_id" value={form.university_id} onChange={onChange}
                  className="input" placeholder="e.g. 22203037" />
                {errors.university_id && <p className="mt-1 text-xs text-rose-600">{errors.university_id}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={onChange} className="input">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
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
                <input id="phone" name="phone" value={form.phone} onChange={onChange}
                  className="input" placeholder="+8801XXXXXXXXX" />
                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={onChange}
                  className="input" placeholder="you@iubat.edu" />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="emergency_contact">Emergency contact (number)</label>
              <input id="emergency_contact" name="emergency_contact" value={form.emergency_contact} onChange={onChange}
                className="input" placeholder="Phone of a parent or guardian" />
              {errors.emergency_contact && <p className="mt-1 text-xs text-rose-600">{errors.emergency_contact}</p>}
            </div>

            {error && <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Your slot will be held for 10 minutes after submission.</p>
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
              Email <a className="text-brand-700 underline" href="mailto:marathon@iubat.edu">marathon@iubat.edu</a> if
              you run into any issues during registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
