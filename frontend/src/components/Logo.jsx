import { useEvent } from '../context/EventContext'
import { formatDate } from '../utils/format'

/** Brand lockup built from event config: "{distance}K" mark, event name, date. */
export default function Logo({ dark = false }) {
  const { event } = useEvent()
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-action-400 px-1.5 font-display text-sm font-extrabold tracking-tight text-brand-950 shadow-sm">
        {event.distance_km}K
      </span>
      <span className="min-w-0 leading-none">
        <span className={`block max-w-[10rem] sm:max-w-[16rem] truncate font-display text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-brand-950'}`}>
          {event.name}
        </span>
        {event.date && (
          <span className={`mt-0.5 block text-[11px] font-medium uppercase tracking-[0.16em] ${dark ? 'text-brand-300' : 'text-brand-500'}`}>
            {formatDate(event.date)}
          </span>
        )}
      </span>
    </span>
  )
}
