import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { LogOut, Search, Loader2, Calendar as CalendarIcon } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import logoAsset from "@/assets/afia-logo.asset.json";

type Status = "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";

const STATUS_META: Record<Status, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "bg-orange-100 text-orange-700 border-orange-200" },
  confirmed:  { label: "Confirmed",  className: "bg-blue-100 text-blue-700 border-blue-200" },
  checked_in: { label: "Checked In", className: "bg-purple-100 text-purple-700 border-purple-200" },
  completed:  { label: "Completed",  className: "bg-green-100 text-green-700 border-green-200" },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-700 border-red-200" },
  no_show:    { label: "No Show",    className: "bg-gray-200 text-gray-700 border-gray-300" },
};

const NEXT_ACTIONS: Record<Status, { label: string; next: Status }[]> = {
  pending: [
    { label: "Confirm", next: "confirmed" },
    { label: "Cancel", next: "cancelled" },
  ],
  confirmed: [
    { label: "Mark Checked In", next: "checked_in" },
    { label: "Cancel", next: "cancelled" },
    { label: "No Show", next: "no_show" },
  ],
  checked_in: [
    { label: "Mark Completed", next: "completed" },
    { label: "No Show", next: "no_show" },
  ],
  completed: [],
  cancelled: [{ label: "Reopen (Pending)", next: "pending" }],
  no_show: [{ label: "Reopen (Pending)", next: "pending" }],
};

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Dashboard — Afia Clinic" }] }),
  component: Admin,
});

function Admin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");

  const { data: doctors = [] } = useQuery({
    queryKey: ["all-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("id,name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", { statusFilter, dateFilter, doctorFilter }],
    queryFn: async () => {
      let q = supabase
        .from("appointments")
        .select("id,reference,patient_name,mobile,appointment_date,appointment_time,status,notes,doctors(name),specialties(name)")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: true })
        .limit(500);
      if (statusFilter !== "all") q = q.eq("status", statusFilter as Status);
      if (dateFilter) q = q.eq("appointment_date", dateFilter);
      if (doctorFilter !== "all") q = q.eq("doctor_id", doctorFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return appointments;
    return appointments.filter(
      (a) =>
        a.patient_name.toLowerCase().includes(s) ||
        a.mobile.toLowerCase().includes(s) ||
        a.reference.toLowerCase().includes(s),
    );
  }, [appointments, search]);

  const today = format(new Date(), "yyyy-MM-dd");
  const kpis = useMemo(() => {
    const todays = appointments.filter((a) => a.appointment_date === today);
    return {
      today: todays.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmedToday: todays.filter((a) => a.status === "confirmed").length,
      completedToday: todays.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      noShows: appointments.filter((a) => a.status === "no_show").length,
    };
  }, [appointments, today]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Top bar */}
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Afia Clinic" className="h-9 w-auto" />
            <span className="font-semibold text-foreground">Afia · Staff Dashboard</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Today" value={kpis.today} />
          <Kpi label="Pending" value={kpis.pending} tone="orange" />
          <Kpi label="Confirmed Today" value={kpis.confirmedToday} tone="blue" />
          <Kpi label="Completed Today" value={kpis.completedToday} tone="green" />
          <Kpi label="Cancelled" value={kpis.cancelled} tone="red" />
          <Kpi label="No Shows" value={kpis.noShows} tone="gray" />
        </div>

        {/* Filters */}
        <Card className="mt-6 p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, mobile or reference"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Doctor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || dateFilter || doctorFilter !== "all" || statusFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDateFilter(""); setDoctorFilter("all"); setStatusFilter("all"); }}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Table */}
        <Card className="mt-4 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td></tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    No appointments match your filters.
                  </td></tr>
                )}
                {filtered.map((a) => {
                  const meta = STATUS_META[a.status as Status];
                  const actions = NEXT_ACTIONS[a.status as Status];
                  return (
                    <tr key={a.id} className="border-t border-border/60 hover:bg-secondary/40">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{a.reference}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{a.patient_name}</td>
                      <td className="px-4 py-3 text-muted-foreground"><a href={`tel:${a.mobile}`} className="hover:text-primary">{a.mobile}</a></td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">{a.doctors?.name}</div>
                        <div className="text-xs text-muted-foreground">{a.specialties?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">{a.appointment_date}</div>
                        <div className="text-xs text-muted-foreground">{a.appointment_time.slice(0, 5)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {actions.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">Update</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((act) => (
                                <DropdownMenuItem
                                  key={act.next}
                                  onClick={() => updateStatus.mutate({ id: a.id, status: act.next })}
                                >
                                  {act.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "primary" }: { label: string; value: number; tone?: "primary" | "orange" | "blue" | "green" | "red" | "gray" }) {
  const tones: Record<string, string> = {
    primary: "text-primary",
    orange: "text-orange-600",
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-600",
  };
  return (
    <Card className="p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  );
}