"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, Trash2, Moon, Settings, CheckSquare, X, ChevronLeft, ChevronRight } from "lucide-react";
import { JumpToDate } from "@/components/jump-to-date";

interface Props {
  user: User;
  onClearAll: () => void;
  activityCount: number;
  view: "week" | "day" | "month";
  onToggleView: () => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToDate: (date: Date) => void;
  currentDate: Date;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  bulkCount: number;
  onBulkDelete: () => void;
  onBulkClear: () => void;
  bulkMode: boolean;
  onToggleBulkMode: () => void;
}

export function Header({
  user, onClearAll, activityCount, view, onToggleView, onToday,
  onPrev, onNext, onJumpToDate, currentDate, onOpenSettings, onOpenProfile,
  bulkCount, onBulkDelete, onBulkClear, bulkMode, onToggleBulkMode,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  const viewLabel = view === "week" ? "Week" : view === "day" ? "Day" : "Month";

  return (
    <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight hidden sm:block">Smart Schedule</h1>
      </div>

      {bulkMode && bulkCount > 0 && (
        <div className="flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-1.5">
          <span className="text-sm font-medium">{bulkCount} selected</span>
          <Button variant="destructive" size="sm" onClick={onBulkDelete} className="h-7">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onBulkClear} className="h-7">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onPrev} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToday} className="text-xs h-8">
          Today
        </Button>
        <Button variant="ghost" size="sm" onClick={onNext} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>

        <JumpToDate view={view} currentDate={currentDate} onJumpToDate={onJumpToDate} />

        <Button variant="ghost" size="sm" onClick={onToggleView} className="text-xs gap-1.5 h-8">
          {viewLabel}
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleBulkMode} className={`h-8 gap-1.5 ${bulkMode ? "text-primary" : ""}`}>
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenSettings} className="h-8 gap-1.5">
          <Moon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenProfile} className="h-8 gap-1.5">
          <Settings className="h-4 w-4" />
        </Button>
        {activityCount > 0 && !bulkMode && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
