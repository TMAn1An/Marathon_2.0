import { useState } from 'react'

const FALLBACK = 'https://placehold.co/800x600/0f1118/ffffff?text=IUBAT+SCSE'

export default function SafeImage({ src, alt = '', fallback = FALLBACK, className = '', ...rest }) {
  const [resolved, setResolved] = useState(src || fallback)
  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setResolved(fallback)}
      className={className}
      {...rest}
    />
  )
}
