import { Link, NavLink } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm transition ${isActive ? "text-primary font-semibold" : "text-slate-600 hover:text-slate-900"}`;

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span>Afia Clinic</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/my-appointments" className={linkCls}>My Appointments</NavLink>
          <NavLink to="/admin" className={linkCls}>Admin</NavLink>
          <Link to="/book" className="ml-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Book Appointment
          </Link>
        </nav>
      </div>
    </header>
  );
}
