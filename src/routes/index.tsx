import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900">عيادة عافية</h1>
          <p className="mt-2 text-blue-700">AFIA CLINIC</p>
          <p className="mt-4 text-muted-foreground">اختر الخدمة التي تريد الوصول إليها</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/patient"
            className="rounded-xl border border-blue-200 bg-white p-8 shadow-sm transition hover:shadow-lg hover:border-blue-400"
          >
            <div className="text-5xl mb-3">👤</div>
            <div className="text-xl font-bold text-blue-900">تسجيل المريض</div>
            <div className="mt-2 text-sm text-muted-foreground">حجز موعد جديد</div>
          </Link>

          <Link
            to="/admin"
            className="rounded-xl border border-blue-200 bg-white p-8 shadow-sm transition hover:shadow-lg hover:border-blue-400"
          >
            <div className="text-5xl mb-3">🏥</div>
            <div className="text-xl font-bold text-blue-900">العيادة الطبية</div>
            <div className="mt-2 text-sm text-muted-foreground">إدارة المواعيد</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
