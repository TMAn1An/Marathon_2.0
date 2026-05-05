import { useState } from 'react'

/**
 * Renders an <img> tag with a guaranteed placeholder fallback if the
 * remote URL fails to load. Default fallback is a neutral
 * placehold.co tile sized to match the requested dimensions.
 *
 * Usage:
 *   <SafeImage src={s.logo} alt={`${s.name} logo`} width={240} height={120} />
 */
export default function SafeImage({
  src,
  alt = '',
  width,
  height,
  className = '',
  fallbackText,
  ...rest
}) {
  const [errored, setErrored] = useState(false)

  const dims = width && height ? `${width}x${height}` : '300x300'
  const fallbackUrl = `https://placehold.co/${dims}/edf2f7/0d723c?text=${encodeURIComponent(
    fallbackText || alt || 'Image',
  )}`

  const finalSrc = !src || errored ? fallbackUrl : src

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
      {...rest}
    />
  )
}
