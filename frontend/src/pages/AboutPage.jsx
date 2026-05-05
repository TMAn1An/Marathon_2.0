export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl">About the marathon</h1>
      <p className="mt-3 text-slate-600">
        The IUBAT CSE 10K Marathon is an annual community run hosted by the Department of Computer
        Science &amp; Engineering at the International University of Business Agriculture and
        Technology (IUBAT). Our goal is simple: bring students, faculty, alumni, and friends of the
        university together for a morning of fitness, fun, and friendly competition.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg">Our mission</h3>
          <p className="mt-2 text-sm text-slate-600">
            Promote a culture of healthy living and grassroots athletics in the IUBAT community,
            and turn race-day into a celebration of student-led organising.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg">Race format</h3>
          <p className="mt-2 text-sm text-slate-600">
            One distance: 10&nbsp;km. Two categories: students and faculty. Capped at 400 runners
            so every participant gets full on-course support.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg">Where it goes</h3>
          <p className="mt-2 text-sm text-slate-600">
            The course starts and finishes at the main IUBAT campus in Uttara, Dhaka, with a scenic
            loop through Diabari, Sector&nbsp;18 and Turag riverside.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg">Inclusive by design</h3>
          <p className="mt-2 text-sm text-slate-600">
            Walkers and first-timers are welcome — there is a generous 2-hour course cut-off so
            everyone can finish at their own pace.
          </p>
        </div>
      </div>
    </div>
  )
}
