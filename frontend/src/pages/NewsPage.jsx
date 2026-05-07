import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { postsApi } from '../api/endpoints'
import { Section, fadeUp, staggerContainer } from '../components/Section'
import SafeImage from '../components/SafeImage'

const TYPE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'event_update', label: 'Event updates' },
  { key: 'general', label: 'From the team' },
]

export default function NewsPage() {
  const [type, setType] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    postsApi
      .list({ post_type: type || undefined, per_page: 24 })
      .then((res) => setPosts(res.data?.data || []))
      .finally(() => setLoading(false))
  }, [type])

  return (
    <>
      <header className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <span className="pill bg-white/10 text-white">News &amp; updates</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Announcements, race-day updates &amp; behind-the-build essays.
          </h1>
        </div>
      </header>

      <Section>
        <div className="mb-10 flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key || 'all'}
              onClick={() => setType(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                type === f.key ? 'bg-brand-500 text-white shadow-glow' : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 lg:grid-cols-3"
          >
            {posts.map((p) => (
              <motion.article key={p.id} variants={fadeUp}>
                <PostCard post={p} />
              </motion.article>
            ))}
          </motion.div>
        )}
      </Section>
    </>
  )
}

function PostCard({ post }) {
  if (post.post_type === 'announcement') {
    return (
      <Link
        to={`/news/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-brand-500 p-7 text-white ring-1 ring-brand-600 transition hover:-translate-y-1"
      >
        <span className="pill bg-white/15 text-white">Announcement</span>
        <h3 className="mt-4 font-display text-xl font-bold">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm text-white/85">{post.excerpt}</p>
        <span className="mt-auto pt-6 text-sm font-semibold">Read more →</span>
      </Link>
    )
  }
  if (post.post_type === 'event_update') {
    return (
      <Link
        to={`/news/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ink-900 p-7 text-white ring-1 ring-white/10 transition hover:-translate-y-1"
      >
        <span className="pill bg-white/10 text-white">Event update</span>
        <h3 className="mt-4 font-display text-xl font-bold">{post.title}</h3>
        <div className="mt-3 text-xs uppercase tracking-widest text-white/50">
          {new Date(post.published_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
        <p className="mt-3 line-clamp-3 text-sm text-white/80">{post.excerpt}</p>
        <span className="mt-auto pt-6 text-sm font-semibold">Read more →</span>
      </Link>
    )
  }
  return (
    <Link
      to={`/news/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100 transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="aspect-[5/3] overflow-hidden bg-ink-100">
        <SafeImage
          src={post.image_url || `https://picsum.photos/seed/post-${post.id}/800/480`}
          alt={post.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="pill-ink">From the team</span>
        <h3 className="mt-3 font-display text-xl font-bold text-ink-900">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm text-ink-600">{post.excerpt}</p>
        <span className="mt-auto pt-6 text-sm font-semibold text-brand-600">Read article →</span>
      </div>
    </Link>
  )
}
