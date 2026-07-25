"use client";

import { type Activity } from "@/types/activity";
import { Clock, MapPin, Users, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i);

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

function getTopPx(time: string, hourHeight: number): number {
  return (timeToMinutes(time) / 60) * hourHeight;
}

function getHeightPx(start: string, end: string, hourHeight: number): number {
  const diff = timeToMinutes(end) - timeToMinutes(start);
  return Math.max((diff / 60) * hourHeight, 28);
}

function extractIcon(notes: string | null): { icon: React.ReactNode; label: string } | null {
  if (!notes) return null;
  const lower = notes.toLowerCase();
  if (lower.includes("at ") || lower.includes("location") || lower.includes("room") || lower.includes("field")) {
    return { icon: <MapPin className="h-3 w-3" />, label: "location" };
  }
  if (lower.includes("with ") || lower.includes("team") || lower.includes("group")) {
    return { icon: <Users className="h-3 w-3" />, label: "people" };
  }
  return null;
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

function getColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export function Timeline({ activities, onEdit, onDelete }: Props) {
  const HOUR_HEIGHT = 64;

  return (
    <div className="relative select-none">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-2">
        <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s Schedule</h2>
      </div>
      <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
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

        {activities
          .filter((a) => a.start_time && a.end_time)
          .sort((a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!))
          .map((activity, i) => (
            <div
              key={activity.id}
              className="absolute group"
              style={{
                left: 56,
                right: 12,
                top: getTopPx(activity.start_time!, HOUR_HEIGHT),
                height: getHeightPx(activity.start_time!, activity.end_time!, HOUR_HEIGHT),
              }}
            >
              <div
                className={`h-full rounded-lg border-l-3 px-3 py-1.5 flex flex-col justify-center overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${getColor(i)}`}
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
                          {extractIcon(activity.notes)?.icon}
                          <span className="truncate">{activity.notes}</span>
                        </span>
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
          ))}

        {activities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No activities yet. Add some notes and generate your schedule!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
