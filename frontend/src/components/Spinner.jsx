export default function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" className="grid min-h-[40vh] place-items-center text-slate-500">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
