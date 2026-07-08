// Simple localStorage-based store for the clinic booking system.
// No backend required - all data persists in the browser.

export type Appointment = {
  id: string;
  fullName: string;
  phone: string;
  doctor: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  createdAt: string;
};

const KEY = "afia_appointments_v1";

export const SPECIALTIES = [
  "طب عام",
  "أسنان",
  "جلدية",
  "أطفال",
  "عيون",
  "باطنية",
  "نساء وتوليد",
  "عظام",
];

export const DOCTORS: Record<string, string[]> = {
  "طب عام": ["د. أحمد علي", "د. سارة محمد"],
  "أسنان": ["د. خالد يوسف", "د. منى إبراهيم"],
  "جلدية": ["د. ليلى حسن"],
  "أطفال": ["د. عمر صالح", "د. هالة فاروق"],
  "عيون": ["د. طارق كمال"],
  "باطنية": ["د. نور الدين"],
  "نساء وتوليد": ["د. فاطمة زهراء"],
  "عظام": ["د. يوسف عبدالله"],
};

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
];

function read(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Appointment[]) : [];
  } catch {
    return [];
  }
}

function write(list: Appointment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getAppointments(): Appointment[] {
  return read().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function addAppointment(a: Omit<Appointment, "id" | "createdAt">): Appointment {
  const list = read();
  const item: Appointment = {
    ...a,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  write(list);
  return item;
}

export function deleteAppointment(id: string) {
  write(read().filter((x) => x.id !== id));
}

// Simple mobile-only "auth" - stored in localStorage for the session.
const ADMIN_KEY = "afia_admin_phone_v1";
export function setAdminPhone(phone: string) {
  if (typeof window !== "undefined") localStorage.setItem(ADMIN_KEY, phone);
}
export function getAdminPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_KEY);
}
export function clearAdminPhone() {
  if (typeof window !== "undefined") localStorage.removeItem(ADMIN_KEY);
}
