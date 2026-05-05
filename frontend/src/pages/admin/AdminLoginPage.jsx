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
      setError(pickErrorMessage(err, 'Could not log in. Please check your credentials.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-900 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-slate-800 shadow-xl">
        <div className="text-center">
          <span className="grid mx-auto h-12 w-12 place-items-center rounded-lg bg-brand-900 text-accent-400 font-bold">10K</span>
          <h1 className="mt-3 text-2xl">IUBAT Marathon Admin</h1>
          <p className="text-sm text-slate-500">Sign in to manage participants and operations.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange}
              required className="input" placeholder="admin@iubat.edu" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange}
              required className="input" placeholder="••••••••" />
          </div>
          {error && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Demo credentials: <code>admin@iubat.edu</code> / <code>admin12345</code>
        </p>
      </div>
    </div>
  )
}
