export default function RouteMapPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl">Route map</h1>
      <p className="mt-3 text-slate-600 max-w-3xl">
        The course is a single 10&nbsp;km loop starting and ending at the IUBAT main campus.
        Aid stations are placed at km 3, km 6, and km 9. Course marshals are stationed at every
        major junction.
      </p>

      <div className="mt-8 card overflow-hidden">
        <div className="aspect-[16/10] w-full bg-slate-100">
          <iframe
            title="IUBAT Marathon Route"
            src="https://www.openstreetmap.org/export/embed.html?bbox=90.3760%2C23.8650%2C90.4150%2C23.8950&layer=mapnik"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="border-t border-slate-100 bg-white p-5">
          <h3 className="text-lg">Aid stations &amp; checkpoints</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3 text-sm text-slate-700">
            <li className="rounded-md bg-brand-50 px-3 py-2">KM 3 · Hydration</li>
            <li className="rounded-md bg-brand-50 px-3 py-2">KM 6 · Hydration + first-aid</li>
            <li className="rounded-md bg-brand-50 px-3 py-2">KM 9 · Final push station</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
