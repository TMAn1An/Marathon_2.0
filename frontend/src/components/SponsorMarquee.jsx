import SafeImage from './SafeImage'

const FALLBACK_SPONSORS = [
  { name: 'Robi', logo: 'https://placehold.co/240x80/ffffff/0f1118?text=Robi' },
  { name: 'Grameenphone', logo: 'https://placehold.co/240x80/ffffff/0f1118?text=GP' },
  { name: 'bKash', logo: 'https://placehold.co/240x80/ffffff/8b0000?text=bKash' },
  { name: 'Daraz', logo: 'https://placehold.co/240x80/ffffff/0f1118?text=Daraz' },
  { name: 'Pathao', logo: 'https://placehold.co/240x80/ffffff/0f1118?text=Pathao' },
  { name: 'Foodpanda', logo: 'https://placehold.co/240x80/ffffff/8b0000?text=foodpanda' },
  { name: 'Walton', logo: 'https://placehold.co/240x80/ffffff/0f1118?text=Walton' },
  { name: 'Apex', logo: 'https://placehold.co/240x80/ffffff/0f1118?text=Apex' },
]

export default function SponsorMarquee({ sponsors }) {
  const list = sponsors && sponsors.length ? sponsors : FALLBACK_SPONSORS
  const looped = [...list, ...list]
  return (
    <div className="marquee">
      <div className="marquee-track">
        {looped.map((s, i) => (
          <div key={`${s.name}-${i}`} className="marquee-item">
            <SafeImage
              src={s.logo_url || s.logo}
              alt={`${s.name} logo`}
              className="max-h-10 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
