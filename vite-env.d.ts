import { supabase } from "@/integrations/supabase/client";
import type { Appointment, Doctor, Specialty, AppointmentStatus } from "@/integrations/supabase/types";

export async function listSpecialties(): Promise<Specialty[]> {
  const { data, error } = await supabase.from("specialties").select("*").eq("active", true).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listDoctors(specialtyId?: string): Promise<Doctor[]> {
  let q = supabase.from("doctors").select("*").eq("active", true).order("name");
  if (specialtyId) q = q.eq("specialty_id", specialtyId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export type CreateAppointmentInput = {
  patient_name: string;
  mobile: string;
  doctor_id: string;
  specialty_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm
  notes?: string;
};

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const { data, error } = await supabase.from("appointments").insert(input).select("*").single();
  if (error) throw error;
  return data as Appointment;
}

export type ListAppointmentsFilters = {
  search?: string;
  date?: string;
  doctorId?: string;
  status?: AppointmentStatus;
};

export async function listAppointments(f: ListAppointmentsFilters = {}): Promise<Appointment[]> {
  let q = supabase.from("appointments").select("*").order("appointment_date", { ascending: false }).order("appointment_time");
  if (f.date) q = q.eq("appointment_date", f.date);
  if (f.doctorId) q = q.eq("doctor_id", f.doctorId);
  if (f.status) q = q.eq("status", f.status);
  if (f.search) q = q.or(`patient_name.ilike.%${f.search}%,mobile.ilike.%${f.search}%,reference.ilike.%${f.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function findAppointmentsByMobile(mobile: string): Promise<Appointment[]> {
  const { data, error } = await supabase.from("appointments").select("*").eq("mobile", mobile).order("appointment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw error;
}
