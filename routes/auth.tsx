import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoAsset from "@/assets/afia-logo.asset.json";
import { ALLOWED_ADMIN_EMAIL, isAllowedAdmin } from "@/lib/access";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Staff Sign In — Afia Clinic" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && isAllowedAdmin(data.session.user.email)) {
        navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!isAllowedAdmin(normalized)) {
      toast.error("هذا الحساب غير مصرح له بالدخول");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!isAllowedAdmin(data.user?.email)) {
      await supabase.auth.signOut();
      toast.error("هذا الحساب غير مصرح له بالدخول");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4" dir="rtl">
      <Card className="w-full max-w-sm p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="mb-6 flex flex-col items-center">
          <img src={logoAsset.url} alt="Afia Clinic" className="h-16 w-auto" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">تسجيل دخول الموظفين</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            موظفو الاستقبال والإدارة فقط.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ALLOWED_ADMIN_EMAIL}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تسجيل الدخول
          </Button>
        </form>
      </Card>
    </div>
  );
}
