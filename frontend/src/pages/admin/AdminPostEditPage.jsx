import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
}

const TYPES = [
  { value: 'announcement', label: 'Announcement', helper: 'High-priority red card on the news feed.' },
  { value: 'event_update', label: 'Event update', helper: 'Schedule/calendar style card on the news feed.' },
  { value: 'general', label: 'General', helper: 'Elegant blog-style card with hero image.' },
]

export default function AdminPostEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState({
    title: '', slug: '', content: '', post_type: 'general',
    event_id: '', is_published: false,
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [events, setEvents] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    adminApi.events().then((res) => setEvents(res.data?.data || [])).catch(() => {})
    if (isEdit) {
      adminApi.post(id).then((res) => {
        const p = res.data?.data
        setForm({
          title: p.title, slug: p.slug, content: p.content, post_type: p.post_type,
          event_id: p.event_id || '', is_published: Boolean(p.published_at),
        })
        setImagePreview(p.image_url)
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const onPickImage = (e) => {
    const f = e.target.files?.[0]
    if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      if (form.slug) fd.append('slug', form.slug)
      fd.append('content', form.content)
      fd.append('post_type', form.post_type)
      if (form.event_id) fd.append('event_id', form.event_id)
      fd.append('is_published', form.is_published ? '1' : '0')
      if (image) fd.append('image', image)

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (isEdit) {
        fd.append('_method', 'PUT')
        await adminApi.updatePost(id, fd, config)
      } else {
        await adminApi.createPost(fd, config)
      }
      navigate('/admin/posts')
    } catch (err) { setError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }

  if (loading) return <div className="skeleton h-96 rounded-2xl" />

  return (
    <form onSubmit={submit} className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/posts" className="text-xs font-semibold text-brand-600 hover:underline">← Posts</Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">{isEdit ? 'Edit post' : 'New post'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" checked={form.is_published} onChange={update('is_published')} />
            Publish immediately
          </label>
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save post'}</button>
        </div>
      </header>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card-elevated space-y-5 p-6">
          <Field label="Title">
            <input className="input text-lg font-display font-semibold" required value={form.title} onChange={update('title')} />
          </Field>
          <Field label="Slug (optional)">
            <input className="input font-mono text-xs" value={form.slug} onChange={update('slug')} placeholder="auto-generated from title" />
          </Field>
          <div>
            <span className="label">Content</span>
            <div className="mt-2 rounded-xl ring-1 ring-ink-200 overflow-hidden">
              <ReactQuill
                theme="snow"
                modules={QUILL_MODULES}
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card-elevated p-5">
            <span className="label">Type</span>
            <div className="mt-2 space-y-2">
              {TYPES.map((t) => (
                <label key={t.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${form.post_type === t.value ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'}`}>
                  <input type="radio" name="post_type" value={t.value} checked={form.post_type === t.value} onChange={update('post_type')} className="mt-1" />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{t.label}</span>
                    <span className="text-xs text-ink-500">{t.helper}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {form.post_type === 'event_update' && (
            <div className="card-elevated p-5">
              <Field label="Linked event">
                <select className="input" value={form.event_id} onChange={update('event_id')}>
                  <option value="">— None —</option>
                  {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </Field>
            </div>
          )}

          <div className="card-elevated p-5">
            <span className="label">Hero image</span>
            <div className="mt-2 overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full" />
              ) : (
                <div className="grid aspect-[5/3] place-items-center text-xs text-ink-500">No image yet</div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="mt-3 text-xs" />
          </div>
        </aside>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}
