import { useEffect, useState } from 'react'
import { listAllAppointments, updateAppointmentStatus } from '@/services/appointments'
import type { Appointment } from '@/integrations/supabase/types'
import { DOCTORS } from '@/lib/utils'

export default function AdminDashboard() {
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ date: '', doctor: '', status: '' })

  async function load() {
    setLoading(true); setError(null)
    try {
      setItems(await listAllAppointments({
        date: filters.date || undefined,
        doctor: filters.doctor || undefined,
        status: filters.status || undefined,
      }))
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() /* eslint-disable-next-line */ }, [])

  async function setStatus(id: string, status: Appointment['status']) {
    await updateAppointmentStatus(id, status)
    setItems(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-slate-600 mt-1">Manage all appointments.</p>

      <div className="mt-4 grid md:grid-cols-4 gap-3">
        <input type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
               className="border rounded-md px-3 py-2" />
        <select value={filters.doctor} onChange={e => setFilters(f => ({ ...f, doctor: e.target.value }))}
                className="border rounded-md px-3 py-2">
          <option value="">All doctors</option>
          {DOCTORS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="border rounded-md px-3 py-2">
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="cancelled">cancelled</option>
          <option value="completed">completed</option>
        </select>
        <button onClick={load} className="rounded-md bg-brand text-white font-medium hover:bg-brand-dark">Apply filters</button>
      </div>

      {loading && <p className="mt-4 text-slate-600">Loading…</p>}
      {error && <p className="mt-4 text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <Th>Patient</Th><Th>Doctor</Th><Th>Date</Th><Th>Time</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-t">
                <Td>
                  <div className="font-medium">{a.patient_name}</div>
                  <div className="text-slate-500 text-xs">{a.patient_email}</div>
                </Td>
                <Td>{a.doctor}</Td>
                <Td>{a.appointment_date}</Td>
                <Td>{a.appointment_time}</Td>
                <Td>{a.status}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(a.id, 'confirmed')} className="text-green-700 hover:underline">Confirm</button>
                    <button onClick={() => setStatus(a.id, 'cancelled')} className="text-red-700 hover:underline">Cancel</button>
                    <button onClick={() => setStatus(a.id, 'completed')} className="text-slate-700 hover:underline">Complete</button>
                  </div>
                </Td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No appointments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const Th = ({ children }: any) => <th className="px-3 py-2 font-semibold">{children}</th>
const Td = ({ children }: any) => <td className="px-3 py-2 align-top">{children}</td>
