export default function Logo({ dark = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-action-400 font-display text-sm font-extrabold tracking-tight text-brand-950 shadow-sm">
        10K
      </span>
      <span className="leading-none">
        <span className={`block font-display text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-brand-950'}`}>
          IUBAT CSE
        </span>
        <span className={`mt-0.5 block text-[11px] font-medium uppercase tracking-[0.16em] ${dark ? 'text-brand-300' : 'text-brand-500'}`}>
          Marathon
        </span>
      </span>
    </span>
  )
}
