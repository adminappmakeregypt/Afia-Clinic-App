import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const link = ({ isActive }: { isActive: boolean }) =>
  cn('px-3 py-2 rounded-md text-sm font-medium', isActive ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100')

export default function SiteHeader() {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-brand text-white grid place-items-center font-bold">+</span>
          <span className="font-semibold text-lg">Afia Clinic</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={link} end>Home</NavLink>
          <NavLink to="/book" className={link}>Book</NavLink>
          <NavLink to="/my-appointments" className={link}>My Appointments</NavLink>
          <NavLink to="/admin" className={link}>Admin</NavLink>
        </nav>
      </div>
    </header>
  )
}
