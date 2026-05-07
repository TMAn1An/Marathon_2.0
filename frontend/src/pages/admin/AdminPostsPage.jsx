import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'

const TYPE_LABELS = { announcement: 'Announcement', event_update: 'Event update', general: 'General' }

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.posts().then((res) => setPosts(res.data?.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const togglePublish = async (post) => {
    try {
      if (post.published_at) await adminApi.unpublishPost(post.id)
      else await adminApi.publishPost(post.id)
      load()
    } catch (err) { setError(pickErrorMessage(err)) }
  }
  const remove = async (post) => {
    if (!confirm(`Delete "${post.title}"?`)) return
    try { await adminApi.deletePost(post.id); load() }
    catch (err) { setError(pickErrorMessage(err)) }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="pill-brand">CMS</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">News &amp; posts</h1>
          <p className="mt-1 text-sm text-ink-500">Announcements, race-day updates, and team essays.</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary">+ New post</Link>
      </header>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      <div className="card-elevated overflow-hidden">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Updated</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-500">Loading…</td></tr>}
            {!loading && posts.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-500">No posts yet.</td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="text-sm">
                <td className="px-6 py-4">
                  <Link to={`/admin/posts/${p.id}`} className="font-display font-semibold text-ink-900 hover:text-brand-600">{p.title}</Link>
                  <div className="text-xs text-ink-500 line-clamp-1">{p.excerpt}</div>
                </td>
                <td className="px-6 py-4 text-ink-700">{TYPE_LABELS[p.post_type]}</td>
                <td className="px-6 py-4">
                  {p.published_at ? <span className="pill bg-emerald-100 text-emerald-700">Published</span> : <span className="pill bg-amber-100 text-amber-700">Draft</span>}
                </td>
                <td className="px-6 py-4 text-xs text-ink-500">{new Date(p.updated_at).toLocaleString('en-GB')}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 text-xs font-semibold">
                    <button onClick={() => togglePublish(p)} className="text-brand-600 hover:underline">
                      {p.published_at ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link to={`/admin/posts/${p.id}`} className="text-ink-600 hover:underline">Edit</Link>
                    <button onClick={() => remove(p)} className="text-rose-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
