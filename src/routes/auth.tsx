import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/afia-logo.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { ALLOWED_ADMIN_EMAIL, isAllowedAdmin, normalizeEmail } from "@/lib/access";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — Afia Clinic" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted || !data.user) return;

      if (isAllowedAdmin(data.user.email)) {
        navigate({ to: "/admin" });
        return;
      }

      await supabase.auth.signOut();
      toast.error("غير مصرح لهذا الحساب بالدخول إلى العيادة الطبية");
    });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedAdmin(normalizedEmail)) {
      toast.error(`الدخول مسموح فقط للبريد الإلكتروني ${ALLOWED_ADMIN_EMAIL}`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    setLoading(false);

    if (userError || !isAllowedAdmin(userData.user?.email)) {
      await supabase.auth.signOut();
      toast.error("غير مصرح لهذا الحساب بالدخول إلى العيادة الطبية");
      return;
    }

    navigate({ to: "/admin" });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-secondary/40 px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl justify-start">
        <Link to="/" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          ← رجوع
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <Card className="w-full max-w-sm p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="mb-6 flex flex-col items-center">
            <img src={logoAsset.url} alt="Afia Clinic" className="h-16 w-auto" />
            <h1 className="mt-4 text-2xl font-semibold text-primary">تسجيل الدخول</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              أدخل البريد الإلكتروني وكلمة المرور للدخول
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="staff-email" className="text-base font-medium text-foreground">
                البريد الإلكتروني
              </Label>
              <Input
                id="staff-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-password" className="text-base font-medium text-foreground">
                كلمة المرور
              </Label>
              <Input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              دخول
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
