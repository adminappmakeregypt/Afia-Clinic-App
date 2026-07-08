import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { addAppointment, DOCTORS, SPECIALTIES, TIME_SLOTS } from "@/lib/clinic-store";

export const Route = createFileRoute("/patient")({
  component: PatientPage,
});

function PatientPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    specialty: "",
    doctor: "",
    date: "",
    time: "",
  });
  const [done, setDone] = useState<null | { id: string }>(null);
  const [error, setError] = useState("");

  const doctors = useMemo(() => (form.specialty ? DOCTORS[form.specialty] ?? [] : []), [form.specialty]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.phone || !form.specialty || !form.doctor || !form.date || !form.time) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
      setError("رقم الهاتف غير صحيح");
      return;
    }
    const a = addAppointment(form);
    setDone({ id: a.id });
  }

  if (done) {
    return (
      <div dir="rtl" className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-bold text-blue-900">تم تأكيد الحجز</h1>
          <p className="mt-2 text-muted-foreground">رقم الحجز: <span className="font-mono">{done.id}</span></p>
          <p className="mt-1 text-sm">التاريخ: {form.date} - {form.time}</p>
          <p className="text-sm">الطبيب: {form.doctor}</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link to="/" className="rounded-md border px-4 py-2 text-sm">الرئيسية</Link>
            <button
              onClick={() => { setDone(null); setForm({ fullName: "", phone: "", specialty: "", doctor: "", date: "", time: "" }); }}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
            >
              حجز جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-4">
          <Link to="/" className="text-sm text-blue-700 hover:underline">← الرئيسية</Link>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h1 className="text-center text-2xl font-bold text-blue-900 py-5 border-b">احجز موعدك</h1>

          <form onSubmit={submit} className="p-6 space-y-4">
            <Field label="أدخل اسم الكامل" icon="👤">
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="أدخل اسم الكامل"
                className="w-full bg-transparent outline-none text-right"
              />
            </Field>

            <Field label="أدخل رقم هاتفك" icon="📞">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="أدخل رقم هاتفك"
                className="w-full bg-transparent outline-none text-right"
              />
            </Field>

            <Field label="اختر التخصص" icon="💼">
              <select
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value, doctor: "" })}
                className="w-full bg-transparent outline-none text-right"
              >
                <option value="">اختر التخصص</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="اختر الطبيب" icon="🩺">
              <select
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                disabled={!form.specialty}
                className="w-full bg-transparent outline-none text-right disabled:opacity-50"
              >
                <option value="">اختر الطبيب</option>
                {doctors.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>

            <Field label="اختر التاريخ" icon="📅">
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-transparent outline-none text-right"
              />
            </Field>

            <Field label="اختر الوقت" icon="🕐">
              <select
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-transparent outline-none text-right"
              >
                <option value="">اختر الوقت</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg transition"
            >
              تأكيد الحجز
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-blue-50/60 rounded-lg px-3 py-2 border border-blue-100">
      <span className="text-blue-600 text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-blue-800/70">{label}</label>
        {children}
      </div>
    </div>
  );
}
