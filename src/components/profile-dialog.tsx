"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { type SceneThemeId } from "@/types/activity";
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
import { User, Palette, Lock, Check } from "lucide-react";

interface Props {
  user: SupabaseUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThemeChange: (theme: SceneThemeId) => void;
}

export function ProfileDialog({ user, open, onOpenChange, onThemeChange }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState<SceneThemeId>("indigo");
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
        setTheme(data.scene_color_theme as SceneThemeId);
      }
    };
    load();
  }, [open, supabase, user.id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ id: user.id, display_name: displayName, scene_color_theme: theme });

    if (error) {
      setMsg("Failed to save profile.");
    } else {
      onThemeChange(theme);
      setMsg("Profile saved!");
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
      setMsg("Password updated!");
      setPassword("");
      setPasswordConfirm("");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile & Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Display Name</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Scene Color Theme
              </CardTitle>
              <CardDescription>Changes the accent color across the app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SCENE_THEMES).map((t) => (
                  <button
                    key={t.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                      theme === t.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border"
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div
                      className="h-5 w-5 rounded-full shrink-0"
                      style={{ backgroundColor: t.accent }}
                    />
                    <span className="flex-1">{t.name}</span>
                    {theme === t.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangePassword}
                disabled={saving || !password}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {msg && <p className="text-sm text-muted-foreground text-center">{msg}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} disabled={saving}>Save Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
