import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('Unhandled UI error:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-3xl">Something went wrong</h1>
          <p className="mt-3 text-slate-600">An unexpected error occurred. Reloading usually fixes it.</p>
          <button className="btn-primary mt-6" onClick={() => window.location.assign('/')}>
            Back to home
          </button>
        </div>
      </div>
    )
  }
}
