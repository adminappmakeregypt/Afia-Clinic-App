import { useState } from 'react'
import { listAppointmentsByEmail } from '@/services/appointments'
import type { Appointment } from '@/integrations/supabase/types'

export default function MyAppointments() {
  const [email, setEmail] = useState('')
  const [items, setItems] = useState<Appointment[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try { setItems(await listAppointmentsByEmail(email)) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">My Appointments</h1>
      <form onSubmit={search} className="mt-4 flex gap-2">
        <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
               className="flex-1 border border-slate-300 rounded-md px-3 py-2" />
        <button className="px-4 py-2 rounded-md bg-brand text-white font-medium hover:bg-brand-dark">Search</button>
      </form>

      {loading && <p className="mt-4 text-slate-600">Loading…</p>}
      {error && <p className="mt-4 text-red-700">{error}</p>}
      {items && items.length === 0 && <p className="mt-4 text-slate-600">No appointments found.</p>}

      <ul className="mt-6 space-y-3">
        {items?.map(a => (
          <li key={a.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
            <div>
              <p className="font-semibold">{a.doctor}</p>
              <p className="text-sm text-slate-600">{a.appointment_date} at {a.appointment_time}</p>
              {a.notes && <p className="text-sm text-slate-500 mt-1">{a.notes}</p>}
            </div>
            <StatusBadge status={a.status} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const map: Record<string,string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-slate-200 text-slate-700',
  }
  return <span className={`px-2 py-1 rounded text-xs font-medium ${map[status]}`}>{status}</span>
}
