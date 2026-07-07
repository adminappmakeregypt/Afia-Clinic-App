import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">Page not found.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-white">Go home</Link>
    </div>
  );
}
