import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'

const DEPARTMENTS = ['CSE', 'EEE', 'CE', 'BBA', 'Pharmacy', 'English', 'Other']

export default function RegistrationForm({ event }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    category: 'student',
    student_id: '',
    department: 'CSE',
    gender: 'male',
    tshirt_size: 'M',
    emergency_contact: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await eventsApi.register(event.slug, form)
      const data = res.data?.data
      navigate(`/payment/${data.participant.id}`, {
        state: { event, registration: data },
      })
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-elevated grid gap-5 p-8 sm:grid-cols-2">
      <Field label="Full name" required>
        <input className="input" required value={form.full_name} onChange={update('full_name')} />
      </Field>
      <Field label="Email">
        <input type="email" className="input" required value={form.email} onChange={update('email')} />
      </Field>
      <Field label="Phone">
        <input className="input" required value={form.phone} onChange={update('phone')} placeholder="+8801XXXXXXXXX" />
      </Field>
      <Field label="Category">
        <select className="input" value={form.category} onChange={update('category')}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>
      </Field>
      {form.category === 'student' && (
        <Field label="Student ID">
          <input className="input" required value={form.student_id} onChange={update('student_id')} />
        </Field>
      )}
      <Field label="Department">
        <select className="input" value={form.department} onChange={update('department')}>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Gender">
        <select className="input" value={form.gender} onChange={update('gender')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </Field>
      <Field label="T-shirt size">
        <select className="input" value={form.tshirt_size} onChange={update('tshirt_size')}>
          {['S', 'M', 'L', 'XL', 'XXL'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Emergency contact" hint="A relative or friend we can reach on race day.">
        <input className="input" value={form.emergency_contact} onChange={update('emergency_contact')} />
      </Field>
      {error && (
        <div className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-100">
          {error}
        </div>
      )}
      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          By submitting you agree to the IUBAT SCSE MINI Marathon participant rules.
        </p>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Reserving slot…' : 'Reserve my slot'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="label">
        {label} {required && <span className="text-brand-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-500">{hint}</span>}
    </label>
  )
}
