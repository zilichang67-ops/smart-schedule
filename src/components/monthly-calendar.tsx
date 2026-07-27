"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { type Activity, type DayLabel, type SceneThemeId } from "@/types/activity";
import { getAdjacentColors } from "@/lib/themes";

interface Props {
  activities: Activity[];
  onSelectDay: (day: Date) => void;
  onEdit: (a: Activity) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  sceneTheme: SceneThemeId;
  month: Date;
  labels: DayLabel[];
  onOpenLabels: (day: Date) => void;
}

export function MonthlyCalendar({ activities, onSelectDay, onEdit, selectedIds, onToggleSelect, sceneTheme, month, labels, onOpenLabels }: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const weeks = eachDayOfInterval({ start: calStart, end: calEnd });

  const scheduled = activities.filter((a) => a.is_scheduled && a.start_time);

  const colorMap = getAdjacentColors(
    scheduled.map((a) => ({ id: a.id, activity_date: a.activity_date, start_time: a.start_time })),
    sceneTheme
  );

  const getActivitiesForDay = (day: Date) =>
    scheduled
      .filter((a) => a.activity_date && isSameDay(new Date(a.activity_date), day))
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/30">
        <h2 className="font-semibold text-sm">{format(month, "MMMM yyyy")}</h2>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <div className="grid grid-cols-7 gap-px">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}

          {weeks.map((day) => {
            const dayActivities = getActivitiesForDay(day);
            const inMonth = isSameMonth(day, month);
            const dayLabels = labels.filter((l) => l.label_date === format(day, "yyyy-MM-dd"));

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] border border-border/20 rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-muted/20 ${
                  !inMonth ? "opacity-30" : ""
                } ${isToday(day) ? "ring-1 ring-primary/50" : ""}`}
                onClick={() => onSelectDay(day)}
                onDoubleClick={(e) => { e.stopPropagation(); onOpenLabels(day); }}
              >
                <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                {dayLabels.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mb-1">
                    {dayLabels.slice(0, 2).map((l) => (
                      <span key={l.id} className="text-[9px] rounded px-1 py-0.5 text-white truncate max-w-full" style={{ backgroundColor: l.color }}>
                        {l.title}
                      </span>
                    ))}
                    {dayLabels.length > 2 && (
                      <span className="text-[9px] text-muted-foreground">+{dayLabels.length - 2}</span>
                    )}
                  </div>
                )}
                <div className="space-y-0.5">
                  {dayActivities.slice(0, 4).map((a) => {
                    const bg = colorMap.get(a.id) || "hsl(240, 60%, 45%)";
                    const selected = selectedIds.has(a.id);
                    const isMilestone = a.start_time && a.end_time && a.start_time === a.end_time;
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center gap-1 text-[10px] rounded px-1 py-0.5 truncate cursor-pointer hover:ring-1 hover:ring-white/20 ${a.is_completed ? "line-through opacity-50" : ""} ${
                          selected ? "ring-2 ring-primary" : ""
                        }`}
                        style={{ backgroundColor: isMilestone ? "transparent" : bg, color: isMilestone ? bg : "white" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selected || e.shiftKey) {
                            onToggleSelect(a.id);
                          } else {
                            onEdit(a);
                          }
                        }}
                      >
                        {isMilestone && <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: bg }} />}
                        <span className="opacity-70">{a.start_time}</span> {a.title}
                      </div>
                    );
                  })}
                  {dayActivities.length > 4 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{dayActivities.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
