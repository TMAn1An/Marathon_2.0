import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { eventApi, slotsApi } from '../api/endpoints'
import { setDefaultCurrency } from '../utils/format'

const EventContext = createContext(null)

// Neutral placeholders shown until /api/event answers (or if it fails).
const FALLBACK = {
  name: 'Community Marathon',
  tagline: '',
  date: null,
  venue: '',
  organizer: '',
  support_email: '',
  distance_km: 10,
  currency: 'BDT',
  map_embed_url: null,
}

/** Loads event info + capacity once and shares it with the whole app. */
export function EventProvider({ children }) {
  const [event, setEvent] = useState(FALLBACK)
  const [categories, setCategories] = useState([])
  const [slots, setSlots] = useState(null)
  const [holdMinutes, setHoldMinutes] = useState(10)
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    eventApi.info().then(({ data }) => {
      const d = data?.data
      if (d?.event) {
        setEvent((e) => ({ ...e, ...d.event }))
        if (d.event.currency) setDefaultCurrency(d.event.currency)
      }
      if (d?.categories) setCategories(d.categories)
      if (d?.hold_minutes) setHoldMinutes(d.hold_minutes)
      setStatus('ready')
    }).catch(() => setStatus('error'))
    slotsApi.current().then(({ data }) => setSlots(data?.data || null)).catch(() => {})
  }, [])

  const value = useMemo(() => ({
    event,
    categories,
    categoryLabel: (id) => categories.find((c) => c.id === id)?.label ?? id,
    slots,
    holdMinutes,
    status,
    totalSlots: slots?.total ?? null,
    distance: event.distance_km,
  }), [event, categories, slots, holdMinutes, status])

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

export function useEvent() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvent must be used inside <EventProvider>')
  return ctx
}
