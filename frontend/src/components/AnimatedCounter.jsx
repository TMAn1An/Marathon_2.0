import { animate, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function AnimatedCounter({ value = 0, suffix = '', decimals = 0, duration = 1.4, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => latest.toFixed(decimals))

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] })
    return controls.stop
  }, [inView, value, duration, motionValue])

  return (
    <span ref={ref} className={className}>
      <span style={{ display: 'none' }}>{value}</span>
      <RoundedDisplay value={rounded} />
      {suffix}
    </span>
  )
}

function RoundedDisplay({ value }) {
  const ref = useRef(null)
  useEffect(
    () =>
      value.on('change', (latest) => {
        if (ref.current) ref.current.textContent = latest
      }),
    [value],
  )
  return <span ref={ref}>0</span>
}
