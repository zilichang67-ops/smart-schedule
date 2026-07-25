"use client";

import { type Activity } from "@/types/activity";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Pencil, Trash2 } from "lucide-react";

interface Props {
  date: Date;
  activities: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i);
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

const COLORS = [
  "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
  "bg-violet-500/20 border-violet-500/40 text-violet-300",
  "bg-purple-500/20 border-purple-500/40 text-purple-300",
  "bg-blue-500/20 border-blue-500/40 text-blue-300",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  "bg-amber-500/20 border-amber-500/40 text-amber-300",
  "bg-rose-500/20 border-rose-500/40 text-rose-300",
];

export function DayTimeline({ date, activities, onEdit, onDelete, onBack }: Props) {
  const sorted = [...activities]
    .filter((a) => a.start_time && a.end_time)
    .sort((a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-card/30">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 w-7 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold text-sm">{format(date, "EEEE, MMMM d, yyyy")}</h2>
      </div>

      <div className="flex-1 overflow-auto relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-border/30"
            style={{ top: hour * HOUR_HEIGHT }}
          >
            <span className="absolute -top-2.5 left-3 text-xs text-muted-foreground bg-background px-1">
              {formatHour(hour)}
            </span>
          </div>
        ))}

        {sorted.map((activity, i) => {
          const startMin = timeToMinutes(activity.start_time!);
          const endMin = timeToMinutes(activity.end_time!);
          const top = (startMin / 60) * HOUR_HEIGHT;
          const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 28);

          return (
            <div
              key={activity.id}
              className="absolute group"
              style={{ left: 56, right: 12, top, height }}
            >
              <div
                className={`h-full rounded-lg border-l-3 px-3 py-1.5 flex flex-col justify-center overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${COLORS[i % COLORS.length]}`}
                onClick={() => onEdit(activity)}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 text-xs opacity-70 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.start_time} - {activity.end_time}
                      </span>
                      {activity.notes && (
                        <span className="flex items-center gap-1 truncate">
                          <span className="truncate">{activity.notes}</span>
                        </span>
                      )}
                      {activity.is_recurring && (
                        <span className="text-[10px] bg-primary/20 rounded px-1">recurring</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-background/20"
                      onClick={(e) => { e.stopPropagation(); onEdit(activity); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
                    >
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
