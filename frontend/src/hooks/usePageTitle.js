import { useEffect } from 'react'
import { useEvent } from '../context/EventContext'

/** Sets the browser tab title ("Page · Event name"). */
export function usePageTitle(title) {
  const { event } = useEvent()
  const base = event.name
  useEffect(() => {
    document.title = title ? `${title} · ${base}` : base
  }, [title, base])
}
