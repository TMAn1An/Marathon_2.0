import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { postsApi } from '../api/endpoints'
import SafeImage from '../components/SafeImage'

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    postsApi.show(slug).then((res) => setPost(res.data?.data)).catch(() => setError('Could not load post.'))
  }, [slug])

  if (error) return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink-700">{error}</div>
  if (!post) return <div className="mx-auto max-w-3xl px-6 py-24"><div className="skeleton h-72 rounded-2xl" /></div>

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <Link to="/news" className="text-sm font-semibold text-brand-600">← All news</Link>
      <span className={`mt-6 inline-flex ${post.post_type === 'announcement' ? 'pill bg-brand-500 text-white' : 'pill-ink'}`}>
        {labelFor(post.post_type)}
      </span>
      <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">{post.title}</h1>
      <div className="mt-3 text-xs uppercase tracking-widest text-ink-500">
        {post.published_at && new Date(post.published_at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}
        {post.admin?.name && <> · by {post.admin.name}</>}
      </div>
      {post.image_url && (
        <div className="mt-8 overflow-hidden rounded-3xl">
          <SafeImage src={post.image_url} alt={post.title} className="w-full" />
        </div>
      )}
      <div
        className="prose prose-lg prose-ink mt-10 max-w-none prose-a:text-brand-600 prose-headings:font-display"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}

function labelFor(type) {
  if (type === 'announcement') return 'Announcement'
  if (type === 'event_update') return 'Event update'
  return 'From the team'
}
