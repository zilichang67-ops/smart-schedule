"use client";

import { useMemo } from "react";
import {
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { type Activity, type SceneThemeId } from "@/types/activity";
import { getAdjacentColors } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface Props {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  activities: Activity[];
  onSelectDay: (date: Date) => void;
  isAsleep: (hour: number) => boolean;
  onEdit: (a: Activity) => void;
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

export function WeeklyCalendar({ currentWeekStart, onWeekChange, activities, onSelectDay, isAsleep, onEdit, selectedIds, onToggleSelect, sceneTheme }: Props) {
  const days = useMemo(() => {
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end });
  }, [currentWeekStart]);

  const weekEnd = useMemo(() => endOfWeek(currentWeekStart, { weekStartsOn: 1 }), [currentWeekStart]);

  const visibleHours = useMemo(() => {
    const hours: number[] = [];
    for (let h = 0; h < 24; h++) {
      if (!isAsleep(h)) hours.push(h);
    }
    return hours;
  }, [isAsleep]);

  const colorMap = useMemo(
    () => getAdjacentColors(activities.map((a) => ({ id: a.id, activity_date: a.activity_date, start_time: a.start_time })), sceneTheme),
    [activities, sceneTheme]
  );

  const getActivitiesForDay = (day: Date) =>
    activities.filter(
      (a) =>
        a.activity_date &&
        isSameDay(new Date(a.activity_date), day) &&
        a.is_scheduled &&
        a.start_time &&
        a.end_time &&
        !isAsleep(timeToMinutes(a.start_time) / 60)
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/30">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">
            {format(currentWeekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onWeekChange(subWeeks(currentWeekStart, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onWeekChange(new Date())} className="text-xs">
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onWeekChange(addWeeks(currentWeekStart, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
                      .filter((a) => Math.floor(timeToMinutes(a.start_time!) / 60) === hour)
                      .map((activity) => {
                        const startMin = timeToMinutes(activity.start_time!);
                        const endMin = timeToMinutes(activity.end_time!);
                        const durationMin = Math.max(endMin - startMin, 15);
                        const topOffset = ((startMin % 60) / 60) * HOUR_HEIGHT;
                        const height = (durationMin / 60) * HOUR_HEIGHT;
                        const bg = colorMap.get(activity.id) || "hsl(240, 60%, 45%)";
                        const selected = selectedIds.has(activity.id);

                        return (
                          <div
                            key={activity.id}
                            className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 border-l-2 cursor-pointer hover:ring-2 hover:ring-white/30 overflow-hidden transition-all ${selected ? "ring-2 ring-primary" : ""}`}
                            style={{ top: topOffset, height: Math.max(height, 18), backgroundColor: bg, color: "white", borderLeftColor: "rgba(255,255,255,0.3)" }}
                            onClick={(e) => {
                              if (selected || e.shiftKey) { onToggleSelect(activity.id); }
                              else { onEdit(activity); }
                            }}
                          >
                            <p className="text-[10px] font-medium truncate">{activity.title}</p>
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
