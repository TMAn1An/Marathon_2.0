import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { eventApi, slotsApi } from '../api/endpoints'

const EventContext = createContext(null)

const FALLBACK = {
  name: 'IUBAT CSE 10K Marathon',
  date: '2026-12-12',
  venue: 'IUBAT Main Campus, Uttara, Dhaka',
  organizer: 'IUBAT CSE Department',
  support_email: 'marathon@iubat.edu',
}

/** Loads event info + capacity once and shares it with the whole app. */
export function EventProvider({ children }) {
  const [event, setEvent] = useState(FALLBACK)
  const [fees, setFees] = useState({ student: 500, faculty: 1000 })
  const [slots, setSlots] = useState(null)
  const [holdMinutes, setHoldMinutes] = useState(10)

  useEffect(() => {
    eventApi.info().then(({ data }) => {
      const d = data?.data
      if (d?.event) setEvent((e) => ({ ...e, ...d.event }))
      if (d?.fees) setFees(d.fees)
      if (d?.hold_minutes) setHoldMinutes(d.hold_minutes)
    }).catch(() => {})
    slotsApi.current().then(({ data }) => setSlots(data?.data || null)).catch(() => {})
  }, [])

  const value = useMemo(
    () => ({ event, fees, slots, holdMinutes, totalSlots: slots?.total ?? null }),
    [event, fees, slots, holdMinutes],
  )

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

export function useEvent() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvent must be used inside <EventProvider>')
  return ctx
}
