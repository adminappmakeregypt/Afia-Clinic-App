import { useState } from "react";
import { toast } from "sonner";
import { findAppointmentsByMobile } from "@/services/appointments";
import type { Appointment } from "@/integrations/supabase/types";

export default function MyAppointments() {
  const [mobile, setMobile] = useState("");
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { setItems(await findAppointmentsByMobile(mobile)); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Appointments</h1>
      <form onSubmit={search} className="mt-4 flex gap-2">
        <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter mobile number"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2" required />
        <button className="rounded-md bg-primary px-4 py-2 text-white font-medium" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {items && (
        <div className="mt-6 rounded-xl border bg-white overflow-hidden">
          {items.length === 0 ? (
            <p className="p-6 text-center text-slate-600">No appointments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr><th className="p-3">Ref</th><th className="p-3">Patient</th><th className="p-3">Date</th><th className="p-3">Time</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3 font-mono">{a.reference}</td>
                    <td className="p-3">{a.patient_name}</td>
                    <td className="p-3">{a.appointment_date}</td>
                    <td className="p-3">{a.appointment_time}</td>
                    <td className="p-3 capitalize">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
