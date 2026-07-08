import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  clearAdminPhone,
  deleteAppointment,
  getAdminPhone,
  getAppointments,
  setAdminPhone,
  type Appointment,
  DOCTORS,
  SPECIALTIES,
} from "@/lib/clinic-store";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { setPhone(getAdminPhone()); }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^[0-9+\-\s]{7,15}$/.test(phoneInput)) {
      setErr("رقم الموبايل غير صحيح");
      return;
    }
    setAdminPhone(phoneInput);
    setPhone(phoneInput);
  }

  if (!phone) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <Link to="/" className="text-sm text-blue-700 hover:underline">← الرئيسية</Link>
          </div>
          <form onSubmit={login} className="bg-white rounded-xl shadow-md p-8 space-y-4">
            <h1 className="text-2xl font-bold text-center text-blue-900">تسجيل دخول العيادة</h1>
            <p className="text-center text-sm text-muted-foreground">الدخول برقم الموبايل فقط</p>
            <div>
              <label className="block text-sm mb-1">رقم الموبايل</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full border rounded-md px-3 py-2 text-right"
              />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button type="submit" className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold py-2">
              ادخل
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard phone={phone} onLogout={() => { clearAdminPhone(); setPhone(null); setPhoneInput(""); }} />;
}

type Filter =
  | { kind: "all" }
  | { kind: "today" }
  | { kind: "name"; value: string }
  | { kind: "phone"; value: string }
  | { kind: "doctor"; value: string }
  | { kind: "specialty"; value: string }
  | { kind: "date"; value: string };

function AdminDashboard({ phone, onLogout }: { phone: string; onLogout: () => void }) {
  const [list, setList] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [tick, setTick] = useState(0);

  useEffect(() => { setList(getAppointments()); }, [tick]);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    switch (filter.kind) {
      case "all": return list;
      case "today": return list.filter((a) => a.date === today);
      case "name": return list.filter((a) => a.fullName.includes(filter.value));
      case "phone": return list.filter((a) => a.phone.includes(filter.value));
      case "doctor": return list.filter((a) => a.doctor === filter.value);
      case "specialty": return list.filter((a) => a.specialty === filter.value);
      case "date": return list.filter((a) => a.date === filter.value);
    }
  }, [list, filter]);

  const allDoctors = Object.values(DOCTORS).flat();

  return (
    <div dir="rtl" className="min-h-screen bg-blue-50/40 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="bg-blue-600 text-white rounded-t-xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">إدارة المواعيد</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-90">📱 {phone}</span>
            <button onClick={onLogout} className="rounded bg-white/20 hover:bg-white/30 px-3 py-1">خروج</button>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <FilterCard icon="📋" label="عرض جميع الحجوزات" onClick={() => setFilter({ kind: "all" })} active={filter.kind === "all"} />
            <FilterCard icon="📅" label="عرض مواعيد اليوم" onClick={() => setFilter({ kind: "today" })} active={filter.kind === "today"} />
            <SearchCard icon="🔍" label="بحث باسم المريض" placeholder="اسم المريض" onSubmit={(v) => setFilter({ kind: "name", value: v })} />
            <SearchCard icon="📱" label="بحث برقم الجوال" placeholder="رقم الجوال" onSubmit={(v) => setFilter({ kind: "phone", value: v })} />
            <SelectCard icon="🩺" label="تصفية حسب الطبيب" options={allDoctors} onSubmit={(v) => setFilter({ kind: "doctor", value: v })} />
            <SelectCard icon="💼" label="تصفية حسب التخصص" options={SPECIALTIES} onSubmit={(v) => setFilter({ kind: "specialty", value: v })} />
            <DateCard icon="🗓️" label="تصفية حسب التاريخ" onSubmit={(v) => setFilter({ kind: "date", value: v })} />
          </div>

          <div className="border-t pt-4">
            <h2 className="font-bold text-blue-900 mb-3">النتائج ({filtered.length})</h2>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد حجوزات</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 text-blue-900">
                    <tr>
                      <th className="p-2 text-right">الاسم</th>
                      <th className="p-2 text-right">الهاتف</th>
                      <th className="p-2 text-right">التخصص</th>
                      <th className="p-2 text-right">الطبيب</th>
                      <th className="p-2 text-right">التاريخ</th>
                      <th className="p-2 text-right">الوقت</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-blue-50/50">
                        <td className="p-2">{a.fullName}</td>
                        <td className="p-2">{a.phone}</td>
                        <td className="p-2">{a.specialty}</td>
                        <td className="p-2">{a.doctor}</td>
                        <td className="p-2">{a.date}</td>
                        <td className="p-2">{a.time}</td>
                        <td className="p-2">
                          <button
                            onClick={() => { if (confirm("حذف الحجز؟")) { deleteAppointment(a.id); setTick(tick + 1); } }}
                            className="text-red-600 hover:underline"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterCard({ icon, label, onClick, active }: { icon: string; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-center transition hover:shadow ${active ? "border-blue-500 bg-blue-50" : "border-blue-100 bg-white"}`}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-blue-900">{label}</div>
    </button>
  );
}

function SearchCard({ icon, label, placeholder, onSubmit }: { icon: string; label: string; placeholder: string; onSubmit: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4">
      <div className="text-center mb-2">
        <div className="text-2xl">{icon}</div>
        <div className="text-sm font-medium text-blue-900">{label}</div>
      </div>
      <div className="flex gap-1">
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="flex-1 border rounded px-2 py-1 text-sm text-right" />
        <button onClick={() => v && onSubmit(v)} className="rounded bg-blue-600 text-white px-3 text-sm hover:bg-blue-700">بحث</button>
      </div>
    </div>
  );
}

function SelectCard({ icon, label, options, onSubmit }: { icon: string; label: string; options: string[]; onSubmit: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4">
      <div className="text-center mb-2">
        <div className="text-2xl">{icon}</div>
        <div className="text-sm font-medium text-blue-900">{label}</div>
      </div>
      <select onChange={(e) => e.target.value && onSubmit(e.target.value)} className="w-full border rounded px-2 py-1 text-sm text-right">
        <option value="">اختر...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DateCard({ icon, label, onSubmit }: { icon: string; label: string; onSubmit: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4">
      <div className="text-center mb-2">
        <div className="text-2xl">{icon}</div>
        <div className="text-sm font-medium text-blue-900">{label}</div>
      </div>
      <input type="date" onChange={(e) => e.target.value && onSubmit(e.target.value)} className="w-full border rounded px-2 py-1 text-sm text-right" />
    </div>
  );
}
