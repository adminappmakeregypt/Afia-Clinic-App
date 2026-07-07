import { useState } from 'react'
import { createAppointment } from '@/services/appointments'
import { DOCTORS, TIME_SLOTS } from '@/lib/utils'

export default function BookAppointment() {
  const [form, setForm] = useState({
    patient_name: '', patient_email: '', patient_phone: '',
    doctor: DOCTORS[0], appointment_date: '', appointment_time: TIME_SLOTS[0], notes: ''
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')
  const [error, setError] = useState<string | null>(null)

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setError(null)
    try {
      await createAppointment({ ...form, patient_phone: form.patient_phone || null, notes: form.notes || null })
      setStatus('ok')
      setForm(f => ({ ...f, patient_name: '', patient_phone: '', appointment_date: '', notes: '' }))
    } catch (err: any) {
      setStatus('err'); setError(err.message ?? 'Failed to book')
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Book an Appointment</h1>
      <p className="text-slate-600 mt-1">Fill in your details below.</p>

      <form onSubmit={submit} className="mt-6 bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <Field label="Full name">
          <input required value={form.patient_name} onChange={update('patient_name')} className="input" />
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Email">
            <input required type="email" value={form.patient_email} onChange={update('patient_email')} className="input" />
          </Field>
          <Field label="Phone (optional)">
            <input value={form.patient_phone} onChange={update('patient_phone')} className="input" />
          </Field>
        </div>
        <Field label="Doctor">
          <select value={form.doctor} onChange={update('doctor')} className="input">
            {DOCTORS.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Date">
            <input required type="date" value={form.appointment_date} onChange={update('appointment_date')} className="input" />
          </Field>
          <Field label="Time">
            <select value={form.appointment_time} onChange={update('appointment_time')} className="input">
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Notes (optional)">
          <textarea value={form.notes} onChange={update('notes')} className="input min-h-[80px]" />
        </Field>

        <button disabled={status === 'saving'} className="w-full py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-60">
          {status === 'saving' ? 'Booking…' : 'Confirm Appointment'}
        </button>

        {status === 'ok' && <p className="text-green-700">Appointment booked! Check "My Appointments" using your email.</p>}
        {status === 'err' && <p className="text-red-700">{error}</p>}
      </form>

    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
