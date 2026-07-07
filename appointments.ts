import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listAppointments, listDoctors, updateAppointmentStatus } from "@/services/appointments";
import type { Appointment, AppointmentStatus, Doctor } from "@/integrations/supabase/types";

const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "checked_in", "completed", "cancelled", "no_show"];

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [items, setItems] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState<{ search: string; date: string; doctorId: string; status: "" | AppointmentStatus }>({
    search: "", date: "", doctorId: "", status: "",
  });
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listAppointments({
        search: filters.search || undefined,
        date: filters.date || undefined,
        doctorId: filters.doctorId || undefined,
        status: (filters.status || undefined) as AppointmentStatus | undefined,
      }));
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { listDoctors().then(setDoctors); }, []);
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [filters]);

  async function changeStatus(id: string, status: AppointmentStatus) {
    try { await updateAppointmentStatus(id, status); toast.success("Status updated"); refresh(); }
    catch (e: any) { toast.error(e.message); }
  }

  const input = "rounded-md border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <input className={input} placeholder="Search name / mobile / ref"
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input className={input} type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <select className={input} value={filters.doctorId} onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}>
          <option value="">All doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className={input} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-6 rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Ref</th><th className="p-3">Patient</th><th className="p-3">Mobile</th>
              <th className="p-3">Date</th><th className="p-3">Time</th><th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No appointments.</td></tr>
            ) : items.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-mono">{a.reference}</td>
                <td className="p-3">{a.patient_name}</td>
                <td className="p-3">{a.mobile}</td>
                <td className="p-3">{a.appointment_date}</td>
                <td className="p-3">{a.appointment_time}</td>
                <td className="p-3">
                  <select className="rounded border px-2 py-1 text-xs" value={a.status}
                    onChange={(e) => changeStatus(a.id, e.target.value as AppointmentStatus)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
