import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-action-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-950">
        Skip to content
      </a>
      <Navbar />
      {/* On the home page the hero slides up underneath the floating nav. */}
      <main id="main" className={`flex-1 ${isHome ? '-mt-[4.5rem]' : 'page-surface'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
