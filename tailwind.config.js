import { Routes, Route } from "react-router-dom";
import SiteHeader from "./components/SiteHeader";
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
