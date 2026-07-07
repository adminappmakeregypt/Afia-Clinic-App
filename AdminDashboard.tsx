import { Link } from "react-router-dom";
import { CalendarCheck, Clock, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-teal-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Book your visit at Afia Clinic
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Fast, simple online appointment booking with our specialists.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/book" className="rounded-md bg-primary px-6 py-3 text-white font-medium hover:opacity-90">
              Book an Appointment
            </Link>
            <Link to="/my-appointments" className="rounded-md border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50">
              My Appointments
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-6 sm:grid-cols-3">
        {[
          { icon: CalendarCheck, title: "Easy Booking", body: "Pick a doctor, date, and time in under a minute." },
          { icon: Clock, title: "Save Time", body: "Skip the queue with scheduled visits." },
          { icon: ShieldCheck, title: "Secure", body: "Your info is stored securely with Supabase." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border bg-white p-6">
            <Icon className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
