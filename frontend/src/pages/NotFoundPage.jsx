import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ink-50 px-6 text-center">
      <div>
        <span className="pill-brand">404</span>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-2 text-sm text-ink-600">The page you're looking for has retired from racing.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    </div>
  )
}
