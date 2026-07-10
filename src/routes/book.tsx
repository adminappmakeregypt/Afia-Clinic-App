import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateSlots } from "@/lib/slots";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Appointment — Afia Clinic" },
      { name: "description", content: "Reserve your visit at Afia Clinic in a minute." },
    ],
  }),
  component: BookPage,
});

// Egyptian mobile: 010/011/012/015 + 8 digits, optionally +20 or 0020
const egMobile = /^(?:\+?20|0)?1[0125]\d{8}$/;

const schema = z.object({
  patient_name: z.string().trim().min(2, "Please enter your full name").max(100),
  mobile: z.string().trim().regex(egMobile, "Enter a valid Egyptian mobile number"),
  specialty_id: z.string().uuid("Please select a specialty"),
  doctor_id: z.string().uuid("Please select a doctor"),
  appointment_date: z.string().min(1, "Please pick a date"),
  appointment_time: z.string().min(1, "Please pick a time"),
  notes: z.string().max(500).optional(),
});

function BookPage() {
  const [form, setForm] = useState({
    patient_name: "",
    mobile: "",
    specialty_id: "",
    doctor_id: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    appointment_time: "",
    notes: "",
  });
  const [confirmation, setConfirmation] = useState<{ reference: string } | null>(null);

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("specialties").select("id,name").eq("active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", form.specialty_id],
    enabled: !!form.specialty_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id,name,consultation_duration,work_start,work_end,working_days")
        .eq("active", true)
        .eq("specialty_id", form.specialty_id)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const selectedDoctor = doctors.find((d) => d.id === form.doctor_id);

  const { data: bookedTimes = [] } = useQuery({
    queryKey: ["booked", form.doctor_id, form.appointment_date],
    enabled: !!form.doctor_id && !!form.appointment_date,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time,status")
        .eq("doctor_id", form.doctor_id)
        .eq("appointment_date", form.appointment_date)
        .neq("status", "cancelled");
      if (error) throw error;
      return data.map((a) => a.appointment_time.slice(0, 5));
    },
  });

  const availableSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    const all = generateSlots(selectedDoctor.work_start, selectedDoctor.work_end, selectedDoctor.consultation_duration);
    return all.filter((s) => !bookedTimes.includes(s));
  }, [selectedDoctor, bookedTimes]);

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse(form);
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          patient_name: parsed.patient_name,
          mobile: parsed.mobile,
          specialty_id: parsed.specialty_id,
          doctor_id: parsed.doctor_id,
          appointment_date: parsed.appointment_date,
          appointment_time: parsed.appointment_time,
          notes: parsed.notes || null,
        })
        .select("reference")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setConfirmation({ reference: data.reference });
    },
    onError: (err: unknown) => {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0]?.message ?? "Please check the form");
      } else if (err && typeof err === "object" && "message" in err) {
        const msg = String((err as { message: string }).message);
        toast.error(
          msg.includes("duplicate") || msg.includes("appointments_doctor")
            ? "This time slot was just taken. Please pick another."
            : msg,
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  if (confirmation) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Card className="p-8 text-center" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reservation received</h1>
            <p className="mt-2 text-muted-foreground">
              Your reservation has been received successfully. The clinic will contact you shortly
              via phone or WhatsApp to confirm your appointment.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking reference</p>
              <p className="mt-1 text-xl font-semibold tracking-wider text-primary">
                {confirmation.reference}
              </p>
            </div>
            <Button
              className="mt-8 w-full"
              onClick={() => {
                setConfirmation(null);
                setForm({
                  patient_name: "",
                  mobile: "",
                  specialty_id: "",
                  doctor_id: "",
                  appointment_date: format(new Date(), "yyyy-MM-dd"),
                  appointment_time: "",
                  notes: "",
                });
              }}
            >
              Book another appointment
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Book your appointment</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the form below. No account required — we'll confirm shortly by phone or WhatsApp.
        </p>

        <Card className="mt-6 p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name *">
                <Input
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                  placeholder="e.g. Ahmed Mohamed"
                  maxLength={100}
                  required
                />
              </Field>
              <Field label="Mobile Number *">
                <Input
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="01012345678"
                  inputMode="tel"
                  maxLength={20}
                  required
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Specialty *">
                <Select
                  value={form.specialty_id}
                  onValueChange={(v) => setForm({ ...form, specialty_id: v, doctor_id: "", appointment_time: "" })}
                >
                  <SelectTrigger><SelectValue placeholder="Choose specialty" /></SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Doctor *">
                <Select
                  value={form.doctor_id}
                  disabled={!form.specialty_id}
                  onValueChange={(v) => setForm({ ...form, doctor_id: v, appointment_time: "" })}
                >
                  <SelectTrigger><SelectValue placeholder={form.specialty_id ? "Choose doctor" : "Select specialty first"} /></SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                    {doctors.length === 0 && form.specialty_id && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No doctors available</div>
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Appointment Date *">
              <Input
                type="date"
                value={form.appointment_date}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value, appointment_time: "" })}
                required
              />
            </Field>

            <Field label="Available Time *">
              {!form.doctor_id ? (
                <p className="text-sm text-muted-foreground">Select a doctor to see available times.</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available slots for this date. Try another day.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm({ ...form, appointment_time: slot })}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        form.appointment_time === slot
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:border-primary/60"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Notes (optional)">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any information you'd like the doctor to know."
                maxLength={500}
                rows={3}
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              disabled={submit.isPending || !form.appointment_time}
              className="w-full"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              {submit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Book Appointment
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}