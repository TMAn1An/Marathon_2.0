import { useEvent } from '../context/EventContext'

export default function RouteMapPage() {
  const { event, distance } = useEvent()

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl">Route map</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-brand-600">
        The course is {distance}&nbsp;km{event.venue ? <> starting and finishing at {event.venue}</> : null}.
        Course marshals are stationed at major junctions and water is available along the route.
      </p>

      <div className="card mt-8 overflow-hidden">
        {event.map_embed_url ? (
          <div className="aspect-[16/10] w-full bg-brand-100">
            <iframe title={`${event.name} route map`} src={event.map_embed_url} className="h-full w-full border-0" loading="lazy" />
          </div>
        ) : (
          <div className="grid aspect-[16/6] place-items-center bg-brand-100 px-6 text-center text-brand-600">
            The route map will be published here soon.
          </div>
        )}
      </div>
    </div>
  )
}
