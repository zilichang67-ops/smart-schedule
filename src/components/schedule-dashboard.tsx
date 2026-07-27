"use client";

import { useState, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type Activity, type UserRole, type SceneThemeId } from "@/types/activity";
import { startOfWeek, format, addDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { useSleepSettings } from "@/hooks/use-sleep-settings";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { applySceneTheme } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { WeeklyCalendar } from "@/components/weekly-calendar";
import { DayTimeline } from "@/components/day-timeline";
import { MonthlyCalendar } from "@/components/monthly-calendar";
import { InputPanel } from "@/components/input-panel";
import { UnscheduledPool } from "@/components/unscheduled-pool";
import { ActivityModal } from "@/components/activity-modal";
import { ConflictModal, type ConflictInfo } from "@/components/conflict-modal";
import { ChatAssistant } from "@/components/chat-assistant";
import { SleepSettingsDialog } from "@/components/sleep-settings-dialog";
import { ProfileDialog } from "@/components/profile-dialog";

interface Props {
  user: User;
}

export function ScheduleDashboard({ user }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [parsing, setParsing] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [pendingActivities, setPendingActivities] = useState<Omit<Activity, "id" | "user_id" | "created_at">[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<"week" | "day" | "month">("week");
  const [monthView, setMonthView] = useState(new Date());
  const [sleepOpen, setSleepOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sceneTheme, setSceneTheme] = useState<SceneThemeId>("indigo");
  const [bulkMode, setBulkMode] = useState(false);
  const [fixingActivity, setFixingActivity] = useState<Activity | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [showCompleted, setShowCompleted] = useState(true);
  const [lastAiAction, setLastAiAction] = useState<{ type: string; data: Activity | Activity[] | null } | null>(null);
  const sleep = useSleepSettings();
  const bulk = useBulkSelection();
  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    sleep.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.from("user_profiles").select("scene_color_theme, user_role").eq("id", user.id).single();
      if (data) {
        setSceneTheme(data.scene_color_theme as SceneThemeId);
        applySceneTheme(data.scene_color_theme as SceneThemeId);
        if (data.user_role) setUserRole(data.user_role as UserRole);
      }
    };
    loadProfile();
  }, [supabase, user.id]);

  useEffect(() => {
    applySceneTheme(sceneTheme);
  }, [sceneTheme]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      applySceneTheme(sceneTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [sceneTheme]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("activity_date", { ascending: true })
        .order("created_at", { ascending: true });
      if (data) setActivities(data);
    };
    fetch();
  }, [supabase, user.id]);

  const timeToMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const checkConflict = (newAct: Activity): Activity | null => {
    if (!newAct.start_time || !newAct.end_time || !newAct.activity_date) return null;
    for (const existing of activities) {
      if (existing.id === newAct.id) continue;
      if (!existing.start_time || !existing.end_time || !existing.activity_date) continue;
      if (existing.activity_date !== newAct.activity_date || !existing.is_scheduled || !newAct.is_scheduled) continue;
      const nS = timeToMinutes(newAct.start_time), nE = timeToMinutes(newAct.end_time);
      const eS = timeToMinutes(existing.start_time), eE = timeToMinutes(existing.end_time);
      if (nS < eE && nE > eS) return existing;
    }
    return null;
  };

  const expandDateBounded = (base: Omit<Activity, "id" | "user_id" | "created_at">): Omit<Activity, "id" | "user_id" | "created_at">[] => {
    if (!base.is_recurring || !base.recurrence_pattern) return [base];
    if (!base.recurrence_start_date || !base.recurrence_end_date) return [base];

    const instances: Omit<Activity, "id" | "user_id" | "created_at">[] = [];
    const start = new Date(base.recurrence_start_date);
    const end = new Date(base.recurrence_end_date);
    const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const patterns = base.recurrence_pattern.split(",");

    const d = new Date(start);
    while (d <= end) {
      const dayName = dayMap[d.getDay()];
      if (patterns.includes(dayName) || base.recurrence_pattern === "DAILY") {
        instances.push({ ...base, activity_date: format(d, "yyyy-MM-dd") });
      }
      d.setDate(d.getDate() + 1);
    }
    return instances.length > 0 ? instances : [base];
  };

  const handleParseComplete = async (parsed: Omit<Activity, "id" | "user_id" | "created_at">[]) => {
    const toInsert: Omit<Activity, "id" | "user_id" | "created_at">[] = [];

    for (const p of parsed) {
      const base = {
        ...p,
        activity_date: p.activity_date || today,
        is_recurring: p.is_recurring || false,
        recurrence_pattern: p.recurrence_pattern || null,
        parent_activity_id: null,
        color_hex: null,
        recurrence_start_date: p.recurrence_start_date || null,
        recurrence_end_date: p.recurrence_end_date || null,
      };
      toInsert.push(...expandDateBounded(base));
    }

    for (const act of toInsert) {
      const conflictAct = checkConflict({ ...act, id: "", user_id: user.id, created_at: "" });
      if (conflictAct) {
        setConflict({ existing: conflictAct, incoming: { ...act, id: "pending", user_id: user.id, created_at: "" } });
        setPendingActivities(toInsert);
        return;
      }
    }

    if (toInsert.length > 0) {
      const withUserId = toInsert.map((a) => ({ ...a, user_id: user.id }));
      const { data, error } = await supabase.from("activities").insert(withUserId).select();
      if (error) {
        console.error("Insert error:", error);
        toast.error("Failed to save: " + error.message);
      } else if (data) {
        setActivities((prev) => [...prev, ...data]);
        toast.success(`Added ${data.length} activit${data.length === 1 ? "y" : "ies"}`);
      }
    }
  };

  const handleConflictResolve = async (keepBoth: boolean) => {
    if (!conflict) return;
    if (!keepBoth) {
      await supabase.from("activities").delete().eq("id", conflict.existing.id);
      setActivities((prev) => prev.filter((a) => a.id !== conflict.existing.id));
    }
    if (pendingActivities.length > 0) {
      const remaining = keepBoth
        ? pendingActivities.filter((a) => !a.start_time || !a.end_time || !a.activity_date || !checkConflict({ ...a, id: "", user_id: user.id, created_at: "" }))
        : pendingActivities;
      if (remaining.length > 0) {
        const withUserId = remaining.map((a) => ({ ...a, user_id: user.id }));
        const { data } = await supabase.from("activities").insert(withUserId).select();
        if (data) setActivities((prev) => [...prev, ...data]);
      }
    }
    setConflict(null);
    setPendingActivities([]);
  };

  const handleUpdateActivity = async (updated: Activity) => {
    const { error } = await supabase.from("activities").update({
      title: updated.title, start_time: updated.start_time, end_time: updated.end_time,
      notes: updated.notes, is_scheduled: updated.is_scheduled, activity_date: updated.activity_date,
      is_recurring: updated.is_recurring, recurrence_pattern: updated.recurrence_pattern,
      is_completed: updated.is_completed,
    }).eq("id", updated.id);
    if (!error) setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingActivity(null);
  };

  const handleDeleteActivity = async (id: string) => {
    const match = activities.find((a) => a.id === id);
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete: " + error.message);
    } else {
      setActivities((prev) => prev.filter((a) => a.id !== id));
      setEditingActivity(null);
      if (match) toast.success(`Deleted "${match.title}"`);
    }
  };

  const handleBulkDeleteSelected = async () => {
    const ids = Array.from(bulk.selectedIds);
    if (ids.length === 0) return;
    const { error } = await supabase.from("activities").delete().in("id", ids);
    if (!error) {
      setActivities((prev) => prev.filter((a) => !bulk.selectedIds.has(a.id)));
      bulk.clear();
      setBulkMode(false);
      toast.success(`Deleted ${ids.length} activit${ids.length === 1 ? "y" : "ies"}`);
    }
  };

  const handleClearAll = async () => {
    const { error } = await supabase.from("activities").delete().eq("user_id", user.id);
    if (!error) setActivities([]);
  };

  const handleDaySelect = (day: Date) => { setSelectedDay(day); setView("day"); };

  const handleToday = () => {
    const now = new Date();
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
    setSelectedDay(now);
    setView("day");
  };

  const handlePrev = () => {
    if (view === "day") {
      setSelectedDay((d) => addDays(d || new Date(), -1));
    } else if (view === "week") {
      setCurrentWeekStart((w) => subWeeks(w, 1));
    } else {
      setMonthView((m) => subMonths(m, 1));
    }
  };

  const handleNext = () => {
    if (view === "day") {
      setSelectedDay((d) => addDays(d || new Date(), 1));
    } else if (view === "week") {
      setCurrentWeekStart((w) => addWeeks(w, 1));
    } else {
      setMonthView((m) => addMonths(m, 1));
    }
  };

  const handleJumpToDate = (date: Date) => {
    setSelectedDay(date);
    setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    setMonthView(date);
  };

  const handleFixWithAI = (activity: Activity) => {
    setFixingActivity(activity);
  };

  const handleActivityModified = async (targetTitle: string, targetDate: string, updates: Record<string, unknown>) => {
    const match = activities.find(
      (a) => a.title.toLowerCase() === targetTitle.toLowerCase() && a.activity_date === targetDate
    );
    if (!match) {
      toast.error(`"${targetTitle}" not found`);
      return;
    }

    const previous = { ...match };

    const { error } = await supabase.from("activities").update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.start_time !== undefined && { start_time: updates.start_time }),
      ...(updates.end_time !== undefined && { end_time: updates.end_time }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.activity_date !== undefined && { activity_date: updates.activity_date }),
    }).eq("id", match.id);

    if (!error) {
      setActivities((prev) =>
        prev.map((a) => a.id === match.id ? { ...a, ...(updates as Partial<Activity>) } : a)
      );
      setLastAiAction({ type: "modify", data: previous });
      toast.success(`Modified "${match.title}"`);
    }
  };

  const handleActivityDeleted = async (targetTitle: string, targetDate: string) => {
    const match = activities.find(
      (a) => a.title.toLowerCase() === targetTitle.toLowerCase() && a.activity_date === targetDate
    );
    if (!match) {
      toast.error(`"${targetTitle}" not found`);
      return;
    }

    const previous = { ...match };
    const { error } = await supabase.from("activities").delete().eq("id", match.id);
    if (!error) {
      setActivities((prev) => prev.filter((a) => a.id !== match.id));
      setLastAiAction({ type: "delete", data: previous });
      toast.success(`Deleted "${match.title}"`);
    }
  };

  const handleScheduleUnscheduled = async (targetTitle: string, targetDate: string, updates: Record<string, unknown>) => {
    const match = activities.find(
      (a) => !a.is_scheduled && a.title.toLowerCase() === targetTitle.toLowerCase()
    );
    if (!match) {
      toast.error(`"${targetTitle}" not found in unscheduled pool`);
      return;
    }

    const previous = { ...match };

    const { error } = await supabase.from("activities").update({
      start_time: (updates.start_time as string) || match.start_time,
      end_time: (updates.end_time as string) || match.end_time,
      activity_date: targetDate,
      is_scheduled: true,
      unscheduled_precision: null,
      target_date: null,
      ...(updates.notes !== undefined && { notes: updates.notes }),
    }).eq("id", match.id);

    if (!error) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === match.id
            ? { ...a, start_time: (updates.start_time as string) || a.start_time, end_time: (updates.end_time as string) || a.end_time, activity_date: targetDate, is_scheduled: true, unscheduled_precision: null, target_date: null }
            : a
        )
      );
      setLastAiAction({ type: "schedule", data: previous });
      toast.success(`Scheduled "${match.title}" on ${targetDate}`);
    }
  };

  const handleBulkDelete = async (filter: { date?: string | null; title?: string | null; unscheduled_only?: boolean | null }) => {
    let query = supabase.from("activities").delete().eq("user_id", user.id);

    if (filter.title) {
      query = query.ilike("title", `%${filter.title}%`);
    }
    if (filter.date) {
      query = query.eq("activity_date", filter.date);
    }
    if (filter.unscheduled_only) {
      query = query.eq("is_scheduled", false);
    }

    const { error } = await query;
    if (!error) {
      let filtered = [...activities];
      if (filter.title) filtered = filtered.filter((a) => a.title.toLowerCase().includes(filter.title!.toLowerCase()));
      if (filter.date) filtered = filtered.filter((a) => a.activity_date === filter.date);
      if (filter.unscheduled_only) filtered = filtered.filter((a) => !a.is_scheduled);
      const ids = new Set(filtered.map((a) => a.id));
      setActivities((prev) => prev.filter((a) => !ids.has(a.id)));
      setLastAiAction({ type: "bulk_delete", data: filtered });
      toast.success(`Deleted ${ids.size} activit${ids.size === 1 ? "y" : "ies"}`);
    }
  };

  const handleRevoke = async () => {
    if (!lastAiAction) return;

    if (lastAiAction.type === "delete" && lastAiAction.data) {
      const a = lastAiAction.data as Activity;
      const { data } = await supabase.from("activities").insert({
        user_id: user.id, title: a.title, start_time: a.start_time, end_time: a.end_time,
        notes: a.notes, is_scheduled: a.is_scheduled, activity_date: a.activity_date,
        is_recurring: a.is_recurring, recurrence_pattern: a.recurrence_pattern,
        is_completed: a.is_completed, unscheduled_precision: a.unscheduled_precision, target_date: a.target_date,
      }).select();
      if (data) setActivities((prev) => [...prev, ...data]);
      toast.success("Activity restored");
    } else if (lastAiAction.type === "modify" && lastAiAction.data) {
      const a = lastAiAction.data as Activity;
      await supabase.from("activities").update({
        title: a.title, start_time: a.start_time, end_time: a.end_time,
        notes: a.notes, activity_date: a.activity_date,
      }).eq("id", a.id);
      setActivities((prev) => prev.map((p) => p.id === a.id ? a : p));
      toast.success("Changes reverted");
    } else if (lastAiAction.type === "bulk_delete" && Array.isArray(lastAiAction.data)) {
      const restored = lastAiAction.data.map((a) => ({
        user_id: user.id, title: a.title, start_time: a.start_time, end_time: a.end_time,
        notes: a.notes, is_scheduled: a.is_scheduled, activity_date: a.activity_date,
        is_recurring: a.is_recurring, recurrence_pattern: a.recurrence_pattern,
        is_completed: a.is_completed, unscheduled_precision: a.unscheduled_precision, target_date: a.target_date,
      }));
      const { data } = await supabase.from("activities").insert(restored).select();
      if (data) setActivities((prev) => [...prev, ...data]);
      toast.success(`Restored ${restored.length} activit${restored.length === 1 ? "y" : "ies"}`);
    }

    setLastAiAction(null);
  };

  const cycleView = () => {
    const order: Array<"week" | "day" | "month"> = ["week", "day", "month"];
    const idx = order.indexOf(view);
    const next = order[(idx + 1) % order.length];
    setView(next);
    if (next === "day" && !selectedDay) setSelectedDay(new Date());
    if (next === "week") setSelectedDay(null);
  };

  const scheduled = activities.filter((a) => a.is_scheduled && (showCompleted || !a.is_completed));
  const unscheduled = activities.filter((a) => !a.is_scheduled && (showCompleted || !a.is_completed));
  const allSelectableIds = scheduled.map((a) => a.id);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        user={user} onClearAll={handleClearAll} activityCount={activities.length}
        view={view} onToggleView={cycleView} onToday={handleToday}
        onPrev={handlePrev} onNext={handleNext}
        onJumpToDate={handleJumpToDate} currentDate={selectedDay || currentWeekStart}
        onOpenSettings={() => setSleepOpen(true)} onOpenProfile={() => setProfileOpen(true)}
        showCompleted={showCompleted}
        onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
        bulkCount={bulk.count} onBulkDelete={handleBulkDeleteSelected}
        onBulkClear={() => { bulk.clear(); setBulkMode(false); }}
        bulkMode={bulkMode} onToggleBulkMode={() => { setBulkMode(!bulkMode); bulk.clear(); }}
      />

      {bulkMode && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Click activities to select, then delete</span>
          <Button variant="ghost" size="sm" onClick={() => bulk.toggleAll(allSelectableIds)} className="text-xs">
            {bulk.count === allSelectableIds.length ? "Deselect All" : "Select All Scheduled"}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_260px] gap-0">
          <div className="overflow-hidden flex flex-col">
            {view === "week" && (
              <WeeklyCalendar
                currentWeekStart={currentWeekStart} onWeekChange={setCurrentWeekStart}
                activities={scheduled} onSelectDay={handleDaySelect}
                onEdit={setEditingActivity} onFixWithAI={handleFixWithAI}
                selectedIds={bulk.selectedIds} onToggleSelect={bulk.toggle}
                sceneTheme={sceneTheme}
              />
            )}
            {view === "day" && (
              <DayTimeline
                date={selectedDay || new Date()}
                activities={scheduled.filter((a) => a.activity_date === format(selectedDay || new Date(), "yyyy-MM-dd"))}
                onEdit={setEditingActivity} onDelete={handleDeleteActivity}
                onBack={() => setView("week")}
                selectedIds={bulk.selectedIds} onToggleSelect={bulk.toggle} sceneTheme={sceneTheme}
                onFixWithAI={handleFixWithAI}
              />
            )}
            {view === "month" && (
              <MonthlyCalendar
                activities={scheduled} onSelectDay={handleDaySelect}
                onEdit={setEditingActivity} selectedIds={bulk.selectedIds}
                onToggleSelect={bulk.toggle} sceneTheme={sceneTheme}
                month={monthView}
              />
            )}
          </div>

          <div className="border-l border-border/50 overflow-y-auto hidden lg:flex lg:flex-col">
            <InputPanel onParse={handleParseComplete} parsing={parsing} setParsing={setParsing} />
            <UnscheduledPool
              activities={unscheduled}
              onEdit={setEditingActivity}
              onDelete={handleDeleteActivity}
              currentMonth={monthView}
              currentDay={selectedDay || undefined}
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden border-t border-border/50">
        <InputPanel onParse={handleParseComplete} parsing={parsing} setParsing={setParsing} compact />
      </div>
      <div className="lg:hidden border-t border-border/50">
        <UnscheduledPool activities={unscheduled} onEdit={setEditingActivity} onDelete={handleDeleteActivity} compact currentMonth={monthView} currentDay={selectedDay || undefined} />
      </div>

      <ChatAssistant
        onActivityParsed={handleParseComplete}
        onActivityModified={handleActivityModified}
        onActivityDeleted={handleActivityDeleted}
        onScheduleUnscheduled={handleScheduleUnscheduled}
        onBulkDelete={handleBulkDelete}
        onRevoke={handleRevoke}
        lastAiAction={lastAiAction}
        today={today}
        existingActivities={activities}
        userRole={userRole}
        fixingActivity={fixingActivity}
        onClearFixing={() => setFixingActivity(null)}
      />

      <SleepSettingsDialog open={sleepOpen} onOpenChange={setSleepOpen} settings={sleep.settings} onUpdate={sleep.update} onReset={sleep.reset} />
      <ProfileDialog user={user} open={profileOpen} onOpenChange={setProfileOpen} onThemeChange={(t) => { setSceneTheme(t); applySceneTheme(t); }} onRoleChange={setUserRole} />

      {editingActivity && (
        <ActivityModal activity={editingActivity} onSave={handleUpdateActivity} onDelete={handleDeleteActivity} onClose={() => setEditingActivity(null)} />
      )}

      {conflict && (
        <ConflictModal conflict={conflict} onResolve={handleConflictResolve} onClose={() => { setConflict(null); setPendingActivities([]); }} />
      )}
    </div>
  );
}
