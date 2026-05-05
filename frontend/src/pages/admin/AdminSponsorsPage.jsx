import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'

const empty = { name: '', tier: 'partner', description: '', website: '', logo_url: '', display_order: 0, is_active: true }

export default function AdminSponsorsPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const { data } = await adminApi.sponsors()
    setItems(data?.data || [])
  }
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (editing.id) {
        await adminApi.updateSponsor(editing.id, editing)
      } else {
        await adminApi.createSponsor(editing)
      }
      setEditing(null)
      load()
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this sponsor?')) return
    await adminApi.deleteSponsor(id)
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Sponsors</h1>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary">Add sponsor</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No sponsors yet.</td></tr>
            )}
            {items.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">{s.description}</div>
                </td>
                <td className="px-4 py-3 capitalize">{s.tier}</td>
                <td className="px-4 py-3">
                  <span className={s.is_active ? 'badge-green' : 'badge-slate'}>{s.is_active ? 'Active' : 'Hidden'}</span>
                </td>
                <td className="px-4 py-3">{s.display_order}</td>
                <td className="px-4 py-3 space-x-2 text-right">
                  <button onClick={() => setEditing({ ...s })} className="text-brand-700 hover:underline text-sm">Edit</button>
                  <button onClick={() => remove(s.id)} className="text-rose-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 px-4">
          <form onSubmit={save} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg">{editing.id ? 'Edit sponsor' : 'Add sponsor'}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Name</label>
                <input required className="input" value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Tier</label>
                <select className="input" value={editing.tier}
                  onChange={(e) => setEditing({ ...editing, tier: e.target.value })}>
                  {['platinum','gold','silver','bronze','partner'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Display order</label>
                <input type="number" className="input" value={editing.display_order || 0}
                  onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Website</label>
                <input className="input" value={editing.website || ''}
                  onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Logo URL</label>
                <input className="input" value={editing.logo_url || ''}
                  onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea rows={3} className="input" value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active
              </label>
            </div>
            {error && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
