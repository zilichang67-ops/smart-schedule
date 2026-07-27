"use client";

import { useMemo } from "react";
import {
  endOfWeek,
  format,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { type Activity, type SceneThemeId } from "@/types/activity";
import { getAdjacentColors } from "@/lib/themes";

interface Props {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  activities: Activity[];
  onSelectDay: (date: Date) => void;
  isAsleep: (hour: number) => boolean;
  onEdit: (a: Activity) => void;
  onFixWithAI: (a: Activity) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  sceneTheme: SceneThemeId;
}

const HOUR_HEIGHT = 48;

function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function roundUpTo15(minutes: number): number {
  return Math.ceil(minutes / 15) * 15;
}

export function WeeklyCalendar({ currentWeekStart, activities, onSelectDay, isAsleep, onEdit, onFixWithAI, selectedIds, onToggleSelect, sceneTheme }: Props) {
  const days = useMemo(() => {
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end });
  }, [currentWeekStart]);

  const getActivitiesForDay = (day: Date) =>
    activities.filter(
      (a) =>
        a.activity_date &&
        isSameDay(new Date(a.activity_date), day) &&
        a.is_scheduled &&
        a.start_time &&
        a.end_time
    );

  const colorMap = useMemo(
    () => getAdjacentColors(activities.map((a) => ({ id: a.id, activity_date: a.activity_date, start_time: a.start_time })), sceneTheme),
    [activities, sceneTheme]
  );

  const visibleHours = useMemo(() => {
    let maxEndHour = 24;
    const hasSleepActivity = activities.some((a) => {
      if (!a.start_time || !a.end_time) return false;
      const startH = Math.floor(timeToMinutes(a.start_time) / 60);
      const endH = Math.ceil(timeToMinutes(a.end_time) / 60);
      for (let h = startH; h < endH; h++) {
        if (isAsleep(h)) return true;
      }
      return false;
    });

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
      if (!isAsleep(h) || hasSleepActivity) hours.push(h);
    }
    return hours;
  }, [activities, isAsleep]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[48px_repeat(7,1fr)] min-w-[700px]">
          <div className="border-r border-border/30" />
          {days.map((day, i) => (
            <div
              key={i}
              className={`border-r border-border/30 text-center py-2 cursor-pointer hover:bg-muted/30 transition-colors ${isToday(day) ? "bg-primary/5" : ""}`}
              onClick={() => onSelectDay(day)}
            >
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div className={`text-lg font-medium ${isToday(day) ? "text-primary" : ""}`}>{format(day, "d")}</div>
            </div>
          ))}

          {visibleHours.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-r border-t border-border/30 relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-1 text-[10px] text-muted-foreground">{formatHour(hour)}</span>
              </div>
              {days.map((day, di) => {
                const dayActivities = getActivitiesForDay(day);
                return (
                  <div key={di} className="border-r border-t border-border/20 relative" style={{ height: HOUR_HEIGHT }}>
                    {dayActivities
                      .filter((a) => {
                        const startH = timeToMinutes(a.start_time!) / 60;
                        return Math.floor(startH) === hour;
                      })
                      .map((activity) => {
                        const startMin = timeToMinutes(activity.start_time!);
                        const endMin = timeToMinutes(activity.end_time!);
                        const isMilestone = startMin === endMin;
                        const durationMin = isMilestone ? 0 : Math.max(endMin - startMin, 15);
                        const topOffset = ((startMin % 60) / 60) * HOUR_HEIGHT;
                        const height = isMilestone ? 0 : (durationMin / 60) * HOUR_HEIGHT;
                        const bg = colorMap.get(activity.id) || "hsl(240, 60%, 45%)";
                        const selected = selectedIds.has(activity.id);

                        if (isMilestone) {
                          return (
                            <div
                              key={activity.id}
                              className="absolute left-0.5 right-0.5 flex items-center gap-1 cursor-pointer group/card"
                              style={{ top: topOffset - 6 }}
                              onClick={(e) => {
                                if (selected || e.shiftKey) { onToggleSelect(activity.id); }
                                else { onEdit(activity); }
                              }}
                            >
                              <div className="h-2 w-2 rounded-full shrink-0 border border-white/50" style={{ backgroundColor: bg }} />
                              <span className="text-[9px] font-medium truncate" style={{ color: bg }}>{activity.title}</span>
                              <button
                                className="opacity-0 group-hover/card:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
                                onClick={(e) => { e.stopPropagation(); onFixWithAI(activity); }}
                                title="Fix with AI"
                              >
                                <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={activity.id}
                            className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 border-l-2 cursor-pointer hover:ring-2 hover:ring-white/30 overflow-hidden transition-all group/card ${selected ? "ring-2 ring-primary" : ""}`}
                            style={{ top: topOffset, height: Math.max(height, 18), backgroundColor: bg, color: "white", borderLeftColor: "rgba(255,255,255,0.3)" }}
                            onClick={(e) => {
                              if (selected || e.shiftKey) { onToggleSelect(activity.id); }
                              else { onEdit(activity); }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <p className={`text-[10px] font-medium truncate ${activity.is_completed ? "line-through opacity-60" : ""}`}>{activity.title}</p>
                              <button
                                className="opacity-0 group-hover/card:opacity-100 transition-opacity text-white/70 hover:text-white shrink-0"
                                onClick={(e) => { e.stopPropagation(); onFixWithAI(activity); }}
                                title="Fix with AI"
                              >
                                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
                              </button>
                            </div>
                            <p className="text-[9px] opacity-70 truncate">{activity.start_time}-{activity.end_time}</p>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
