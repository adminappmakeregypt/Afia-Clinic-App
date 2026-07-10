import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, MessageCircle, Stethoscope, CalendarCheck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import logoAsset from "@/assets/afia-logo.asset.json";

const WHATSAPP = "201118659992";
const PHONE = "+20 11 18659992";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id,name,qualifications,photo_url,specialties(name)")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialties")
        .select("id,name,description")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-soft)" }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted integrated medical care
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Welcome to <span style={{ color: "var(--color-primary)" }}>Afia Clinic</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Book your appointment online in under a minute — no account needed. Our team will
              confirm with you shortly by phone or WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <CalendarCheck className="h-5 w-5" />
                Book Appointment
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <MessageCircle className="h-5 w-5" style={{ color: "#25D366" }} />
                WhatsApp Us
              </a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div
              className="rounded-3xl bg-card p-10"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <img src={logoAsset.url} alt="Afia Clinic logo" className="h-56 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Specialties</h2>
            <p className="mt-2 text-muted-foreground">Comprehensive care across the essentials.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((s) => (
            <Card
              key={s.id}
              className="group border-border/60 p-6 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{s.name}</h3>
              {s.description && (
                <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Meet Our Doctors</h2>
          <p className="mt-2 text-muted-foreground">Experienced specialists ready to see you.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <Card
                key={d.id}
                className="flex items-start gap-4 border-border/60 p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {d.name.replace(/^Dr\.?\s*/i, "").slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground">{d.name}</h3>
                  <p className="text-sm text-primary">{d.specialties?.name}</p>
                  {d.qualifications && (
                    <p className="mt-1 text-xs text-muted-foreground">{d.qualifications}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Location */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Call the Clinic</h3>
            <a href={`tel:${PHONE}`} className="mt-1 block text-sm text-muted-foreground hover:text-primary">
              {PHONE}
            </a>
          </Card>
          <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Working Hours</h3>
            <p className="mt-1 text-sm text-muted-foreground">Sat – Thu · 9:00 AM – 9:00 PM</p>
            <p className="text-sm text-muted-foreground">Friday · Closed</p>
          </Card>
          <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Location</h3>
            <p className="mt-1 text-sm text-muted-foreground">Afia Clinic — Cairo, Egypt</p>
          </Card>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
          <iframe
            title="Afia Clinic location"
            src="https://www.google.com/maps?q=Cairo,Egypt&output=embed"
            className="h-72 w-full"
            loading="lazy"
          />
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Afia Clinic — Integrated Medical Care.
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105"
        style={{ backgroundColor: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}