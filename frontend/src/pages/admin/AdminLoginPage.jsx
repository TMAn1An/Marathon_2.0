import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { pickErrorMessage } from '../../api/client'

export default function AdminLoginPage() {
  const { admin, login } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (admin) navigate('/admin', { replace: true })
  }, [admin, navigate])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(pickErrorMessage(err, 'Could not sign in. Please check your credentials.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4 text-white">
      <div className="absolute inset-0 bg-grid-fade" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-10 text-ink-800 shadow-card">
        <div className="text-center">
          <img src="https://placehold.co/96x96/ED1C24/ffffff?text=IUBAT&font=playfair" alt="IUBAT logo" className="mx-auto h-12 w-12 rounded-xl" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Admin console</h1>
          <p className="mt-1 text-sm text-ink-500">IUBAT SCSE MINI Marathon</p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} required className="input" placeholder="superadmin@iubat.edu" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange} required className="input" placeholder="••••••••" />
          </div>
          {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
