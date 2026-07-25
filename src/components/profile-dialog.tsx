"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { type SceneThemeId, type UserRole } from "@/types/activity";
import { SCENE_THEMES } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Palette, Lock, Check, Sun, Moon, Monitor, GraduationCap, Briefcase, Globe } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { type Locale } from "@/i18n/en";

interface Props {
  user: SupabaseUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThemeChange: (theme: SceneThemeId) => void;
  onRoleChange?: (role: UserRole) => void;
}

export function ProfileDialog({ user, open, onOpenChange, onThemeChange, onRoleChange }: Props) {
  const { theme, setTheme } = useTheme();
  const { t, locale: currentLocale, setLocale: setI18nLocale } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [sceneTheme, setSceneTheme] = useState<SceneThemeId>("indigo");
  const [preferredLang, setPreferredLang] = useState<Locale>(currentLocale);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (data) {
        setDisplayName(data.display_name || "");
        setSceneTheme(data.scene_color_theme as SceneThemeId);
        if (data.preferred_language) {
          setPreferredLang(data.preferred_language as Locale);
        }
        if (data.user_role) {
          setUserRole(data.user_role as UserRole);
        }
      }
    };
    load();
  }, [open, supabase, user.id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg("");
    setI18nLocale(preferredLang);
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ id: user.id, display_name: displayName, scene_color_theme: sceneTheme, preferred_language: preferredLang, user_role: userRole });

    if (error) {
      setMsg("Failed to save profile.");
    } else {
      onThemeChange(sceneTheme);
      onRoleChange?.(userRole);
      setMsg(t.profileSaved);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setMsg("Passwords don't match.");
      return;
    }
    setSaving(true);
    setMsg("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg(error.message);
    } else {
      setMsg(t.passwordUpdated);
      setPassword("");
      setPasswordConfirm("");
    }
    setSaving(false);
  };

  const modeOptions = [
    { value: "dark", label: t.dark, icon: Moon },
    { value: "light", label: t.light, icon: Sun },
    { value: "system", label: t.system, icon: Monitor },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t.profile}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t.displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.displayName}
              />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                    preferredLang === "en"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-border"
                  }`}
                  onClick={() => setPreferredLang("en")}
                >
                  <span>🇺🇸</span>
                  <span className="flex-1 text-left">English</span>
                  {preferredLang === "en" && <Check className="h-4 w-4" />}
                </button>
                <button
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                    preferredLang === "vi"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-border"
                  }`}
                  onClick={() => setPreferredLang("vi")}
                >
                  <span>🇻🇳</span>
                  <span className="flex-1 text-left">Tiếng Việt</span>
                  {preferredLang === "vi" && <Check className="h-4 w-4" />}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {t.profileRole}
              </CardTitle>
              <CardDescription>{userRole === "student" ? t.studentDesc : t.workerDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                    userRole === "student"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-border text-muted-foreground"
                  }`}
                  onClick={() => setUserRole("student")}
                >
                  <GraduationCap className="h-5 w-5" />
                  {t.student}
                </button>
                <button
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                    userRole === "worker"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-border text-muted-foreground"
                  }`}
                  onClick={() => setUserRole("worker")}
                >
                  <Briefcase className="h-5 w-5" />
                  {t.worker}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sun className="h-4 w-4" />
                {t.appearance}
              </CardTitle>
              <CardDescription>{t.appearanceDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {modeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                        theme === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 hover:border-border text-muted-foreground"
                      }`}
                      onClick={() => setTheme(opt.value)}
                    >
                      <Icon className="h-5 w-5" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                {t.sceneColor}
              </CardTitle>
              <CardDescription>{t.sceneDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SCENE_THEMES).map((th) => (
                  <button
                    key={th.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                      sceneTheme === th.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border"
                    }`}
                    onClick={() => setSceneTheme(th.id)}
                  >
                    <div
                      className="h-5 w-5 rounded-full shrink-0 ring-2 ring-white/20"
                      style={{ backgroundColor: th.accent }}
                    />
                    <span className="flex-1">{th.name}</span>
                    {sceneTheme === th.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t.changePassword}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.newPassword}
              />
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder={t.confirmPassword}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangePassword}
                disabled={saving || !password}
              >
                {t.updatePassword}
              </Button>
            </CardContent>
          </Card>

          {msg && <p className="text-sm text-muted-foreground text-center">{msg}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={handleSaveProfile} disabled={saving}>{t.saveProfile}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
