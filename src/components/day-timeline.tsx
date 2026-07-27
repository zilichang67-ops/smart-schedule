"use client";

import { useMemo } from "react";
import { type Activity, type SceneThemeId } from "@/types/activity";
import { format } from "date-fns";
import { getAdjacentColors } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Pencil, Trash2, Sparkles } from "lucide-react";

interface Props {
  date: Date;
  activities: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  isAsleep: (hour: number) => boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  sceneTheme: SceneThemeId;
  onFixWithAI: (a: Activity) => void;
}

const HOUR_HEIGHT = 64;

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function roundUpTo15(minutes: number): number {
  return Math.ceil(minutes / 15) * 15;
}

export function DayTimeline({ date, activities, onEdit, onDelete, onBack, isAsleep, selectedIds, onToggleSelect, sceneTheme, onFixWithAI }: Props) {
  const sorted = [...activities]
    .filter((a) => a.start_time && a.end_time)
    .sort((a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!));

  const colorMap = useMemo(
    () => getAdjacentColors(sorted.map((a) => ({ id: a.id, activity_date: a.activity_date, start_time: a.start_time })), sceneTheme),
    [sorted, sceneTheme]
  );

  const visibleHours = useMemo(() => {
    let maxEndHour = 24;
    for (const a of activities) {
      if (a.start_time && a.end_time) {
        const endMin = timeToMinutes(a.end_time);
        const endHour = Math.ceil(endMin / 60);
        if (endHour > maxEndHour) maxEndHour = endHour;
      }
    }
    const roundedMax = roundUpTo15(maxEndHour * 60) / 60;
    const hours: number[] = [];
    for (let h = 0; h < Math.min(roundedMax, 25); h++) {
      hours.push(h);
    }
    return hours;
  }, [activities]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-card/30">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 w-7 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold text-sm">{format(date, "EEEE, MMMM d, yyyy")}</h2>
      </div>

      <div className="flex-1 overflow-auto relative" style={{ height: visibleHours.length * HOUR_HEIGHT }}>
        {visibleHours.map((hour, idx) => (
          <div key={hour} className="absolute left-0 right-0 border-t border-border/30" style={{ top: idx * HOUR_HEIGHT }}>
            <span className="absolute -top-2.5 left-3 text-xs text-muted-foreground bg-background px-1">{formatHour(hour)}</span>
          </div>
        ))}

        {sorted.map((activity) => {
          const startMin = timeToMinutes(activity.start_time!);
          const endMin = timeToMinutes(activity.end_time!);
          const isMilestone = startMin === endMin;
          const startHour = Math.floor(startMin / 60);
          const visibleIdx = visibleHours.indexOf(startHour);
          if (visibleIdx === -1) return null;
          const top = visibleIdx * HOUR_HEIGHT + ((startMin % 60) / 60) * HOUR_HEIGHT;
          const height = isMilestone ? 0 : Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 28);
          const bg = colorMap.get(activity.id) || "hsl(240, 60%, 45%)";
          const selected = selectedIds.has(activity.id);

          if (isMilestone) {
            return (
              <div key={activity.id} className="absolute group" style={{ left: 56, right: 12, top: top - 10 }}>
                <div
                  className={`flex items-center gap-2 cursor-pointer transition-all hover:opacity-80 ${selected ? "opacity-100" : ""}`}
                  onClick={(e) => {
                    if (selected || e.shiftKey) { onToggleSelect(activity.id); }
                    else { onEdit(activity); }
                  }}
                >
                  <div className="relative shrink-0">
                    <div className="h-3 w-3 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: bg }} />
                    <div className="absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-30" style={{ backgroundColor: bg }} />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono opacity-60 shrink-0">{activity.start_time}</span>
                    <span className="text-xs font-medium truncate" style={{ color: bg }}>{activity.title}</span>
                    {activity.notes && <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">· {activity.notes}</span>}
                    {activity.is_recurring && <span className="text-[9px] bg-primary/10 text-primary rounded px-1 shrink-0">recurring</span>}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={activity.id} className="absolute group" style={{ left: 56, right: 12, top, height }}>
              <div
                className={`h-full rounded-lg border-l-3 px-3 py-1.5 flex flex-col justify-center overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-white/30 ${selected ? "ring-2 ring-primary" : ""}`}
                style={{ backgroundColor: bg, color: "white", borderLeftColor: "rgba(255,255,255,0.3)" }}
                onClick={(e) => {
                  if (selected || e.shiftKey) { onToggleSelect(activity.id); }
                  else { onEdit(activity); }
                }}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm truncate ${activity.is_completed ? "line-through opacity-60" : ""}`}>{activity.title}</p>
                    <div className="flex items-center gap-2 text-xs opacity-70 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isMilestone ? activity.start_time : `${activity.start_time} - ${activity.end_time}`}
                      </span>
                      {activity.notes && <span className="truncate">{activity.notes}</span>}
                      {activity.is_recurring && <span className="text-[10px] bg-white/20 rounded px-1">recurring</span>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onFixWithAI(activity); }} title="Fix with AI">
                      <Sparkles className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onEdit(activity); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-500/30" onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No activities for this day</p>
          </div>
        )}
      </div>
    </div>
  );
}
