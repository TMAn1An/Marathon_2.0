import { useState } from 'react'

/**
 * <img> that degrades to a neutral, self-contained placeholder tile when the
 * source is missing or fails to load (no third-party placeholder service).
 */
export default function SafeImage({ src, alt = '', width, height, className = '', fallbackText, ...rest }) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    const label = (fallbackText || alt || '?').trim()
    return (
      <span
        role="img"
        aria-label={alt}
        style={{ width, height }}
        className={`inline-grid place-items-center overflow-hidden bg-brand-50 px-2 text-center text-xs font-semibold text-brand-700 ${className}`}
      >
        {label.length > 24 ? `${label.slice(0, 22)}…` : label}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={className}
      {...rest}
    />
  )
}
