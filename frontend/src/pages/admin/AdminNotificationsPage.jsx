import { useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    channel: 'email',
    subject: '',
    body: '',
    category: '',
    status: '',
  })
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFeedback('')
    setBusy(true)
    try {
      const payload = { ...form }
      if (!payload.category) delete payload.category
      if (!payload.status) delete payload.status
      const { data } = await adminApi.bulkNotify(payload)
      setFeedback(data?.message || `Notification queued for ${data?.data?.recipients} recipients.`)
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl">Bulk notifications</h1>
      <p className="text-sm text-slate-600 max-w-2xl">
        Send a mock email or SMS broadcast. By default the message is sent to all confirmed
        participants — narrow the audience using the filters below.
      </p>

      <form onSubmit={onSubmit} className="card p-6 space-y-4 max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Channel</label>
            <select name="channel" value={form.channel} onChange={onChange} className="input">
              <option value="email">Email</option>
              <option value="sms">SMS (mock)</option>
            </select>
          </div>
          <div>
            <label className="label">Audience category</label>
            <select name="category" value={form.category} onChange={onChange} className="input">
              <option value="">All</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label className="label">Audience status</label>
            <select name="status" value={form.status} onChange={onChange} className="input">
              <option value="">Confirmed (default)</option>
              <option value="confirmed">Confirmed</option>
              <option value="reserved">Reserved</option>
              <option value="pending_payment">Pending payment</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {form.channel === 'email' && (
          <div>
            <label className="label">Subject</label>
            <input name="subject" value={form.subject} onChange={onChange} className="input"
              placeholder="Race-day reminder" required />
          </div>
        )}

        <div>
          <label className="label">Message body</label>
          <textarea name="body" value={form.body} onChange={onChange} rows={6} required
            className="input" placeholder="Write your message…" />
        </div>

        {feedback && <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
        {error && <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Sending…' : 'Send notification'}
        </button>
      </form>
    </div>
  )
}
