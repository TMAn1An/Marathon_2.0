import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-brand-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h4 className="text-white text-lg font-semibold">IUBAT CSE 10K Marathon</h4>
          <p className="mt-3 text-sm text-slate-400 max-w-sm">
            A community run hosted by the IUBAT Department of Computer Science &amp; Engineering.
            Run with us, make memories, and support student-led athletics.
          </p>
        </div>
        <div>
          <h4 className="text-white text-base font-semibold">Quick links</h4>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link to="/about" className="hover:text-accent-300">About the marathon</Link></li>
            <li><Link to="/route" className="hover:text-accent-300">Route map</Link></li>
            <li><Link to="/registration-info" className="hover:text-accent-300">Registration info</Link></li>
            <li><Link to="/faq" className="hover:text-accent-300">FAQ</Link></li>
            <li><Link to="/admin/login" className="hover:text-accent-300">Admin login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-base font-semibold">Contact</h4>
          <ul className="mt-3 space-y-1 text-sm text-slate-400">
            <li>IUBAT, Uttara, Dhaka 1230</li>
            <li>marathon@iubat.edu</li>
            <li>+880 1700 000000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-900/60 py-4 text-center text-xs text-slate-500">
        © {year} IUBAT CSE Department · Built for the IUBAT CSE 10K Marathon
      </div>
    </footer>
  )
}
