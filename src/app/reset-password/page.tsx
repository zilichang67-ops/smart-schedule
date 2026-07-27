"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const checkSession = useCallback(async () => {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        setValidLink(true);
        setChecking(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidLink(true);
      } else {
        setValidLink(false);
      }
    } catch {
      setValidLink(false);
    }
    setChecking(false);
  }, [supabase]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push("/auth"), 2000);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t.enterNewPassword}</h1>
        </div>

        <Card className="border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {t.enterNewPassword}
            </CardTitle>
            <CardDescription>{t.enterNewPassword}</CardDescription>
          </CardHeader>
          <CardContent>
            {!validLink ? (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-destructive/10 p-4 flex items-center gap-3 justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{t.invalidResetLink}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  The reset link may have expired. Please request a new one.
                </p>
                <Button onClick={() => router.push("/forgot-password")} className="w-full">
                  {t.resetPassword}
                </Button>
              </div>
            ) : success ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-sm font-medium">{t.passwordUpdatedLogin}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t.enterNewPassword}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{t.confirmNewPassword}</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.loading : t.updateMyPassword}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
