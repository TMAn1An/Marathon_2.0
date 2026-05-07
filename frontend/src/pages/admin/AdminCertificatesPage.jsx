import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'

export default function AdminCertificatesPage() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState(null)
  const [template, setTemplate] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [duplicateFromId, setDuplicateFromId] = useState('')
  const [signature1, setSignature1] = useState(null)
  const [signature2, setSignature2] = useState(null)

  useEffect(() => {
    adminApi.events().then((res) => {
      const list = res.data?.data || []
      // live first, then upcoming, then past
      const sorted = [...list].sort((a, b) => {
        const order = { live: 0, upcoming: 1, past: 2 }
        return (order[a.status] ?? 3) - (order[b.status] ?? 3)
      })
      setEvents(sorted)
      if (sorted.length && !eventId) setEventId(sorted[0].id)
    }).catch((err) => setError(pickErrorMessage(err)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!eventId) return
    setSignature1(null); setSignature2(null)
    adminApi.certificateTemplate(eventId).then((res) => setTemplate(res.data?.data)).catch((err) => setError(pickErrorMessage(err)))
  }, [eventId])

  const update = (k) => (e) => setTemplate((t) => ({ ...t, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('_method', 'PUT')
      fd.append('primary_color', template.primary_color || '#ED1C24')
      fd.append('signature_1_name', template.signature_1_name || '')
      fd.append('signature_1_designation', template.signature_1_designation || '')
      fd.append('signature_2_name', template.signature_2_name || '')
      fd.append('signature_2_designation', template.signature_2_designation || '')
      if (signature1) fd.append('signature_1', signature1)
      if (signature2) fd.append('signature_2', signature2)
      const res = await adminApi.saveCertificateTemplate(eventId, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTemplate(res.data?.data)
      setSignature1(null); setSignature2(null)
    } catch (err) { setError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }

  const duplicate = async () => {
    if (!duplicateFromId) return
    if (!confirm('Replace the current template with the source template settings?')) return
    setBusy(true)
    setError(null)
    try {
      const res = await adminApi.duplicateCertificateTemplate(eventId, duplicateFromId)
      setTemplate(res.data?.data)
    } catch (err) { setError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }

  if (!template) return <div className="skeleton h-64 rounded-2xl" />

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="pill-brand">Certificate engine</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Certificate templates</h1>
          <p className="mt-1 text-sm text-ink-500">Per-event colour, signatures &amp; designations.</p>
        </div>
        <select className="input max-w-xs" value={eventId ?? ''} onChange={(e) => setEventId(Number(e.target.value))}>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title} · {e.status.toUpperCase()}</option>
          ))}
        </select>
      </header>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <form onSubmit={save} className="card-elevated space-y-5 p-6">
          <h3 className="font-display text-lg font-bold text-ink-900">Theme &amp; signatures</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary colour">
              <div className="flex items-center gap-3">
                <input type="color" className="h-10 w-16 cursor-pointer rounded-lg border border-ink-200" value={template.primary_color || '#ED1C24'} onChange={update('primary_color')} />
                <input className="input font-mono text-xs" value={template.primary_color || ''} onChange={update('primary_color')} />
              </div>
            </Field>
          </div>

          <SignatureRow
            label="Signature 1"
            current={template.signature_1_url}
            file={signature1}
            onPick={setSignature1}
            name={template.signature_1_name || ''}
            onName={(v) => setTemplate((t) => ({ ...t, signature_1_name: v }))}
            designation={template.signature_1_designation || ''}
            onDesignation={(v) => setTemplate((t) => ({ ...t, signature_1_designation: v }))}
          />
          <SignatureRow
            label="Signature 2"
            current={template.signature_2_url}
            file={signature2}
            onPick={setSignature2}
            name={template.signature_2_name || ''}
            onName={(v) => setTemplate((t) => ({ ...t, signature_2_name: v }))}
            designation={template.signature_2_designation || ''}
            onDesignation={(v) => setTemplate((t) => ({ ...t, signature_2_designation: v }))}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save template'}</button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="card-elevated p-6">
            <h3 className="font-display text-lg font-bold text-ink-900">Duplicate from</h3>
            <p className="mt-1 text-sm text-ink-500">Copy colours and signatures from another event template.</p>
            <select className="input mt-3" value={duplicateFromId} onChange={(e) => setDuplicateFromId(e.target.value)}>
              <option value="">— Choose source event —</option>
              {events.filter((e) => e.id !== eventId).map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <button onClick={duplicate} disabled={!duplicateFromId || busy} className="btn-outline mt-3 w-full">Duplicate</button>
          </div>

          <div className="card-elevated p-6">
            <h3 className="font-display text-lg font-bold text-ink-900">Live preview</h3>
            <div
              className="mt-4 aspect-[1.41/1] rounded-2xl ring-1 ring-ink-100 bg-white p-6 text-center"
              style={{ backgroundImage: `linear-gradient(135deg, ${template.primary_color || '#ED1C24'}10, transparent 60%)` }}
            >
              <div className="font-display text-xs uppercase tracking-widest" style={{ color: template.primary_color || '#ED1C24' }}>Certificate of Participation</div>
              <div className="mt-3 font-display text-base font-bold">Aisha Khan</div>
              <div className="mt-0.5 font-mono text-xs text-ink-500">MIN_0031</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] text-ink-500">
                <div>{template.signature_1_name || 'Signature 1'}<br /><span className="text-ink-400">{template.signature_1_designation || 'Designation'}</span></div>
                <div>{template.signature_2_name || 'Signature 2'}<br /><span className="text-ink-400">{template.signature_2_designation || 'Designation'}</span></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SignatureRow({ label, current, file, onPick, name, onName, designation, onDesignation }) {
  const previewUrl = file ? URL.createObjectURL(file) : current
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
      <div>
        <span className="label">{label} image</span>
        <div className="mt-2 grid h-28 place-items-center overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100">
          {previewUrl ? <img src={previewUrl} alt="" className="max-h-24 object-contain" /> : <span className="text-xs text-ink-400">No image</span>}
        </div>
        <input type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0] || null)} className="mt-2 text-xs" />
      </div>
      <div className="space-y-3">
        <Field label="Name"><input className="input" value={name} onChange={(e) => onName(e.target.value)} placeholder="Prof. Name" /></Field>
        <Field label="Designation"><input className="input" value={designation} onChange={(e) => onDesignation(e.target.value)} placeholder="Director, SCSE" /></Field>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}
