import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Quality care, <span className="text-brand">on your schedule.</span>
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            Book appointments with Afia Clinic's trusted doctors in seconds.
            Manage upcoming visits and receive reminders — all in one place.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/book" className="px-5 py-3 rounded-md bg-brand text-white font-medium hover:bg-brand-dark">
              Book an Appointment
            </Link>
            <Link to="/my-appointments" className="px-5 py-3 rounded-md border border-slate-300 font-medium hover:bg-slate-100">
              My Appointments
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h2 className="font-semibold text-lg">Why Afia?</h2>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li>✓ Same-week appointment availability</li>
            <li>✓ Experienced, licensed doctors</li>
            <li>✓ Simple online booking & tracking</li>
            <li>✓ Friendly patient support</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
