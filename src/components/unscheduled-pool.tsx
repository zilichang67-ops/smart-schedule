"use client";

import { type Activity } from "@/types/activity";
import { Pencil, Trash2, GripVertical, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
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
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Unscheduled ({activities.length})
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="h-6 w-6 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">No unscheduled items</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
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
                    {activity.notes && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.notes}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
