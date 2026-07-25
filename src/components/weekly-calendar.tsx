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
import { type Activity } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface Props {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  activities: Activity[];
  onSelectDay: (date: Date) => void;
  isAsleep: (hour: number) => boolean;
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

const DAY_COLORS = [
  "bg-indigo-500/20 border-indigo-500/40",
  "bg-violet-500/20 border-violet-500/40",
  "bg-purple-500/20 border-purple-500/40",
  "bg-blue-500/20 border-blue-500/40",
  "bg-cyan-500/20 border-cyan-500/40",
  "bg-emerald-500/20 border-emerald-500/40",
  "bg-amber-500/20 border-amber-500/40",
];

export function WeeklyCalendar({ currentWeekStart, onWeekChange, activities, onSelectDay, isAsleep }: Props) {
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
              className={`border-r border-border/30 text-center py-2 cursor-pointer hover:bg-muted/30 transition-colors ${
                isToday(day) ? "bg-primary/5" : ""
              }`}
              onClick={() => onSelectDay(day)}
            >
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div className={`text-lg font-medium ${isToday(day) ? "text-primary" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}

          {visibleHours.map((hour) => (
            <HourRow
              key={hour}
              hour={hour}
              days={days}
              getActivitiesForDay={getActivitiesForDay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HourRow({
  hour,
  days,
  getActivitiesForDay,
}: {
  hour: number;
  days: Date[];
  getActivitiesForDay: (day: Date) => Activity[];
}) {
  return (
    <>
      <div className="border-r border-t border-border/30 relative" style={{ height: HOUR_HEIGHT }}>
        <span className="absolute -top-2 right-1 text-[10px] text-muted-foreground">
          {formatHour(hour)}
        </span>
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

                return (
                  <div
                    key={activity.id}
                    className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 border-l-2 cursor-pointer hover:ring-1 hover:ring-primary/50 overflow-hidden ${DAY_COLORS[di]}`}
                    style={{ top: topOffset, height: Math.max(height, 18) }}
                  >
                    <p className="text-[10px] font-medium truncate">{activity.title}</p>
                    <p className="text-[9px] opacity-70 truncate">
                      {activity.start_time}-{activity.end_time}
                    </p>
                  </div>
                );
              })}
          </div>
        );
      })}
    </>
  );
}
