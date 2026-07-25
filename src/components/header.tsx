"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, Trash2, CalendarDays, Moon } from "lucide-react";

interface Props {
  user: User;
  onClearAll: () => void;
  activityCount: number;
  view: "week" | "day";
  onToggleView: () => void;
  onOpenSettings: () => void;
}

export function Header({ user, onClearAll, activityCount, view, onToggleView, onOpenSettings }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight hidden sm:block">Smart Schedule</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onToggleView} className="text-xs gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {view === "week" ? "Week" : "Day"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenSettings} className="gap-1.5">
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Sleep</span>
        </Button>
        {activityCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user.email}
        </span>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
