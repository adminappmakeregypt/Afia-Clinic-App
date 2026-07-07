import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { listDoctors, listSpecialties, createAppointment } from "@/services/appointments";
import type { Doctor, Specialty } from "@/integrations/supabase/types";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    mobile: "",
    specialty_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  useEffect(() => {
    listSpecialties().then(setSpecialties).catch((e) => toast.error(e.message));
  }, []);

  useEffect(() => {
    if (!form.specialty_id) { setDoctors([]); return; }
    listDoctors(form.specialty_id).then(setDoctors).catch((e) => toast.error(e.message));
  }, [form.specialty_id]);

  const canSubmit = useMemo(() =>
    form.patient_name && form.mobile && form.doctor_id && form.specialty_id && form.appointment_date && form.appointment_time,
    [form]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const appt = await createAppointment(form);
      toast.success(`Booked! Reference: ${appt.reference}`);
      navigate("/my-appointments");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  }

  const input = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary";
  const label = "block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Book an Appointment</h1>
      <p className="mt-1 text-slate-600">Fill in the details below.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border bg-white p-6">
        <div>
          <label className={label}>Patient Name</label>
          <input className={input} value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} required />
        </div>
        <div>
          <label className={label}>Mobile Number</label>
          <input className={input} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Specialty</label>
            <select className={input} value={form.specialty_id} onChange={(e) => setForm({ ...form, specialty_id: e.target.value, doctor_id: "" })} required>
              <option value="">Select…</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Doctor</label>
            <select className={input} value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required disabled={!form.specialty_id}>
              <option value="">Select…</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Date</label>
            <input type="date" className={input} value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required />
          </div>
          <div>
            <label className={label}>Time</label>
            <input type="time" className={input} value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required />
          </div>
        </div>
        <div>
          <label className={label}>Notes (optional)</label>
          <textarea className={input} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button type="submit" disabled={!canSubmit || loading} className="mt-2 rounded-md bg-primary px-4 py-2 text-white font-medium disabled:opacity-50">
          {loading ? "Booking…" : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
