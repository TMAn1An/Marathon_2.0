import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { pickErrorMessage } from '../../api/client'
import Alert from '../../components/Alert'
import Logo from '../../components/Logo'

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
      setError(pickErrorMessage(err, 'Could not log in. Please check your credentials.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hero-bg grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-brand-800 shadow-lift">
        <div className="text-center">
          <div className="flex justify-center"><Logo /></div>
          <h1 className="mt-5 text-2xl">Organizer sign in</h1>
          <p className="mt-1 text-sm text-brand-600">Manage registrations, payments and results.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange}
              required className="input" autoComplete="username" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange}
              required autoComplete="current-password" className="input" placeholder="••••••••" />
          </div>
          <Alert>{error}</Alert>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  )
}
