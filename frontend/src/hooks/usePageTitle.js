import { useEffect } from 'react'

/** Sets the browser tab title; restores the base title on unmount. */
export function usePageTitle(title, base = 'IUBAT CSE 10K Marathon') {
  useEffect(() => {
    document.title = title ? `${title} · ${base}` : base
  }, [title, base])
}
