import { useEffect, useState } from 'react'

export function useCountdown(targetDate) {
  const compute = () => {
    if (!targetDate) return null
    const diff = new Date(targetDate).getTime() - Date.now()
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    return { expired: false, days, hours, minutes, seconds }
  }

  const [time, setTime] = useState(compute)

  useEffect(() => {
    const id = setInterval(() => setTime(compute()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate])

  return time
}
