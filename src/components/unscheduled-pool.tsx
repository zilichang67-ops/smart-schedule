"use client";

import { type Activity } from "@/types/activity";
import { Pencil, Trash2, GripVertical, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

function extractMeta(notes: string | null) {
  if (!notes) return null;
  const parts: { icon: React.ReactNode; text: string }[] = [];
  const lower = notes.toLowerCase();

  if (lower.includes("with ")) {
    const match = notes.match(/with\s+([^,]+)/i);
    if (match) parts.push({ icon: <Users className="h-3 w-3" />, text: match[1].trim() });
  }
  if (lower.includes("at ")) {
    const match = notes.match(/at\s+([^,]+)/i);
    if (match) parts.push({ icon: <MapPin className="h-3 w-3" />, text: match[1].trim() });
  }

  return parts.length > 0 ? parts : null;
}

export function UnscheduledPool({ activities, onEdit, onDelete, compact }: Props) {
  if (compact) {
    return (
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Unscheduled ({activities.length})
        </p>
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground">No unscheduled items</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activities.map((a) => (
              <div
                key={a.id}
                className="group flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 cursor-pointer hover:border-amber-500/40 transition-colors"
                onClick={() => onEdit(a)}
              >
                <GripVertical className="h-3 w-3 text-amber-500/50 shrink-0" />
                <span className="text-sm truncate">{a.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(a.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Unscheduled ({activities.length})
        </h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            No unscheduled activities
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Activities without specific times appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => {
            const meta = extractMeta(activity.notes);
            return (
              <Card
                key={activity.id}
                className="border-border/50 bg-card/50 cursor-pointer hover:border-amber-500/30 transition-colors group"
                onClick={() => onEdit(activity)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-amber-500/50 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      {meta && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {meta.map((m, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                              {m.icon}
                              {m.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => { e.stopPropagation(); onEdit(activity); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
