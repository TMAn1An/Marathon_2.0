import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminAdminsPage() {
  const { admin: currentAdmin } = useAdminAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' })

  const load = () => {
    setLoading(true)
    adminApi.admins().then((res) => setAdmins(res.data?.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await adminApi.createAdmin(form)
      setForm({ name: '', email: '', password: '', role: 'admin' })
      setCreating(false)
      load()
    } catch (err) { setError(pickErrorMessage(err)) }
  }

  const remove = async (a) => {
    if (a.id === currentAdmin?.id) { alert('You cannot delete your own account.'); return }
    if (!confirm(`Remove ${a.name}?`)) return
    try { await adminApi.deleteAdmin(a.id); load() }
    catch (err) { setError(pickErrorMessage(err)) }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="pill-brand">Access control</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Admins</h1>
          <p className="mt-1 text-sm text-ink-500">Super admins manage the admin pool.</p>
        </div>
        <button onClick={() => setCreating((c) => !c)} className="btn-primary">{creating ? 'Cancel' : '+ New admin'}</button>
      </header>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      {creating && (
        <form onSubmit={submit} className="card-elevated grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Name"><input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Email"><input type="email" className="input" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
          <Field label="Password"><input type="password" className="input" required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></Field>
          <Field label="Role"><select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}><option value="admin">admin</option><option value="super_admin">super_admin</option></select></Field>
          <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-primary" type="submit">Create admin</button></div>
        </form>
      )}

      <div className="card-elevated overflow-hidden">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {loading && <tr><td colSpan={4} className="px-6 py-8 text-center text-ink-500">Loading…</td></tr>}
            {!loading && admins.map((a) => (
              <tr key={a.id} className="text-sm">
                <td className="px-6 py-4 font-medium text-ink-900">{a.name}{a.id === currentAdmin?.id && <span className="ml-2 pill-brand">you</span>}</td>
                <td className="px-6 py-4 text-ink-700">{a.email}</td>
                <td className="px-6 py-4"><span className={`pill ${a.role === 'super_admin' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-700'}`}>{a.role}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => remove(a)} disabled={a.id === currentAdmin?.id} className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}
