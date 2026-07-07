import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">Page not found.</p>
      <Link to="/" className="mt-4 inline-block text-brand font-medium hover:underline">Back home</Link>
    </section>
  )
}
