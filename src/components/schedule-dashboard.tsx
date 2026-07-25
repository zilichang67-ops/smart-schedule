"use client";

import { useState, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { type Activity } from "@/types/activity";
import { InputPanel } from "@/components/input-panel";
import { Timeline } from "@/components/timeline";
import { UnscheduledPool } from "@/components/unscheduled-pool";
import { ActivityModal } from "@/components/activity-modal";
import { ConflictModal } from "@/components/conflict-modal";
import { Header } from "@/components/header";

interface Props {
  user: User;
}

export interface ConflictInfo {
  existing: Activity;
  incoming: Activity;
}

export function ScheduleDashboard({ user }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [parsing, setParsing] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data) setActivities(data);
    };
    fetch();
  }, [supabase, user.id]);

  const checkConflict = (newActivity: Activity): boolean => {
    const scheduled = activities.filter((a) => a.is_scheduled);
    for (const existing of scheduled) {
      if (!newActivity.start_time || !existing.start_time) continue;
      if (!newActivity.end_time || !existing.end_time) continue;

      const newStart = timeToMinutes(newActivity.start_time);
      const newEnd = timeToMinutes(newActivity.end_time);
      const existStart = timeToMinutes(existing.start_time);
      const existEnd = timeToMinutes(existing.end_time);

      if (newStart < existEnd && newEnd > existStart) {
        setConflict({ existing, incoming: newActivity });
        return true;
      }
    }
    return false;
  };

  const timeToMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const handleParseComplete = async (parsed: Omit<Activity, "id" | "user_id" | "created_at">[]) => {
    const newActivities: Activity[] = [];
    let hasConflict = false;

    for (const p of parsed) {
      const activity: Activity = {
        ...p,
        id: crypto.randomUUID(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      if (activity.is_scheduled && activity.start_time) {
        if (checkConflict(activity)) {
          hasConflict = true;
          setPendingActivity(activity);
          break;
        }
      }

      newActivities.push(activity);
    }

    if (newActivities.length > 0) {
        const { data } = await supabase
          .from("activities")
          .insert(newActivities.map((a) => ({ user_id: a.user_id, title: a.title, start_time: a.start_time, end_time: a.end_time, notes: a.notes, is_scheduled: a.is_scheduled })))
          .select();

      if (data) {
        setActivities((prev) => [...prev, ...data]);
      }
    }

    if (hasConflict) return;
  };

  const handleConflictResolve = async (keepBoth: boolean) => {
    if (!conflict) return;

    if (!keepBoth) {
      await supabase
        .from("activities")
        .delete()
        .eq("id", conflict.existing.id);

      setActivities((prev) => prev.filter((a) => a.id !== conflict.existing.id));
    }

    if (pendingActivity) {
      const conflictStillExists = !keepBoth
        ? false
        : activities.some((a) => {
            if (a.id === pendingActivity.id || !a.start_time || !pendingActivity.start_time || !pendingActivity.end_time || !a.end_time) return false;
            const pS = timeToMinutes(pendingActivity.start_time);
            const pE = timeToMinutes(pendingActivity.end_time);
            const aS = timeToMinutes(a.start_time);
            const aE = timeToMinutes(a.end_time);
            return pS < aE && pE > aS;
          });

      if (!conflictStillExists) {
        const { data } = await supabase
          .from("activities")
          .insert({
            user_id: user.id,
            title: pendingActivity.title,
            start_time: pendingActivity.start_time,
            end_time: pendingActivity.end_time,
            notes: pendingActivity.notes,
            is_scheduled: pendingActivity.is_scheduled,
          })
          .select();

        if (data) {
          setActivities((prev) => [...prev, ...data]);
        }
      }
    }

    setConflict(null);
    setPendingActivity(null);
  };

  const handleUpdateActivity = async (updated: Activity) => {
    const { error } = await supabase
      .from("activities")
      .update({
        title: updated.title,
        start_time: updated.start_time,
        end_time: updated.end_time,
        notes: updated.notes,
        is_scheduled: updated.is_scheduled,
      })
      .eq("id", updated.id);

    if (!error) {
      setActivities((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    }
    setEditingActivity(null);
  };

  const handleDeleteActivity = async (id: string) => {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (!error) {
      setActivities((prev) => prev.filter((a) => a.id !== id));
    }
    setEditingActivity(null);
  };

  const handleClearAll = async () => {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setActivities([]);
    }
  };

  const scheduled = activities.filter((a) => a.is_scheduled);
  const unscheduled = activities.filter((a) => !a.is_scheduled);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header user={user} onClearAll={handleClearAll} activityCount={activities.length} />

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[340px_1fr_260px] gap-0">
          <div className="border-r border-border/50 overflow-y-auto hidden lg:block">
            <InputPanel
              onParse={handleParseComplete}
              parsing={parsing}
              setParsing={setParsing}
            />
          </div>

          <div className="overflow-y-auto">
            <Timeline
              activities={scheduled}
              onEdit={setEditingActivity}
              onDelete={handleDeleteActivity}
            />
          </div>

          <div className="border-l border-border/50 overflow-y-auto hidden lg:block">
            <UnscheduledPool
              activities={unscheduled}
              onEdit={setEditingActivity}
              onDelete={handleDeleteActivity}
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden border-t border-border/50">
        <InputPanel
          onParse={handleParseComplete}
          parsing={parsing}
          setParsing={setParsing}
          compact
        />
      </div>

      <div className="lg:hidden border-t border-border/50">
        <UnscheduledPool
          activities={unscheduled}
          onEdit={setEditingActivity}
          onDelete={handleDeleteActivity}
          compact
        />
      </div>

      {editingActivity && (
        <ActivityModal
          activity={editingActivity}
          onSave={handleUpdateActivity}
          onDelete={handleDeleteActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {conflict && (
        <ConflictModal
          conflict={conflict}
          onResolve={handleConflictResolve}
          onClose={() => {
            setConflict(null);
            setPendingActivity(null);
          }}
        />
      )}
    </div>
  );
}
