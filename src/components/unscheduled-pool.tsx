"use client";

import { useMemo, useState } from "react";
import { format, isSameMonth, isSameDay, isWithinInterval, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { type Activity, type ActivityGroup } from "@/types/activity";
import { Pencil, Trash2, GripVertical, Clock, CalendarDays, CalendarRange, Circle, CalendarClock, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  currentMonth?: Date;
  currentDay?: Date;
  groups: ActivityGroup[];
}

function BucketItem({ activity, onEdit, onDelete, groupColor }: { activity: Activity; onEdit: (a: Activity) => void; onDelete: (id: string) => void; groupColor?: string | null }) {
  return (
    <Card
      key={activity.id}
      className="border-border/50 bg-card/50 cursor-pointer hover:border-amber-500/30 transition-colors group"
      style={groupColor ? { borderLeftColor: groupColor, borderLeftWidth: 3 } : undefined}
      onClick={() => onEdit(activity)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-amber-500/50 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{activity.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {activity.target_date && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(activity.target_date), "MMM d")}
                </span>
              )}
              {activity.notes && (
                <span className="text-xs text-muted-foreground truncate">{activity.notes}</span>
              )}
            </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); onEdit(activity); }}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UnscheduledPool({ activities, onEdit, onDelete, compact, currentMonth, currentDay, groups }: Props) {
  const [rangeWeeks, setRangeWeeks] = useState(2);

  const buckets = useMemo(() => {
    const general: Activity[] = [];
    const thisMonth: Activity[] = [];
    const thisWeek: Activity[] = [];
    const specificDays: Activity[] = [];
    const customRange: Activity[] = [];

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const rangeEnd = addWeeks(now, rangeWeeks);

    for (const a of activities) {
      if (a.unscheduled_precision === "DATE" && a.target_date) {
        const d = new Date(a.target_date);
        if (isWithinInterval(d, { start: weekStart, end: weekEnd })) {
          thisWeek.push(a);
        }
        specificDays.push(a);
      } else if (a.unscheduled_precision === "MONTH" && a.target_date) {
        thisMonth.push(a);
      } else if (a.unscheduled_precision === "WEEK" && a.target_date) {
        const d = new Date(a.target_date);
        if (isWithinInterval(d, { start: weekStart, end: rangeEnd })) {
          customRange.push(a);
        }
      } else {
        general.push(a);
      }
    }

    const filteredMonth = currentMonth
      ? thisMonth.filter((a) => a.target_date && isSameMonth(new Date(a.target_date), currentMonth))
      : thisMonth;

    const filteredDays = currentDay
      ? specificDays.filter((a) => a.target_date && isSameDay(new Date(a.target_date), currentDay))
      : specificDays;

    return { general, thisMonth: filteredMonth, thisWeek, specificDays: filteredDays, customRange };
  }, [activities, currentMonth, currentDay, rangeWeeks]);

  const totalCount = activities.length;

  if (compact) {
    return (
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Unscheduled ({totalCount})
        </p>
        {totalCount === 0 ? (
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
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/30 p-1">
          <TabsTrigger value="all" className="text-[10px] gap-1 flex-1 min-w-0">
            <Circle className="h-2.5 w-2.5" />
            All ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="general" className="text-[10px] gap-1 flex-1 min-w-0">
            <Clock className="h-2.5 w-2.5" />
            General ({buckets.general.length})
          </TabsTrigger>
          <TabsTrigger value="week" className="text-[10px] gap-1 flex-1 min-w-0">
            <CalendarClock className="h-2.5 w-2.5" />
            Week ({buckets.thisWeek.length})
          </TabsTrigger>
          <TabsTrigger value="month" className="text-[10px] gap-1 flex-1 min-w-0">
            <CalendarRange className="h-2.5 w-2.5" />
            Month ({buckets.thisMonth.length})
          </TabsTrigger>
          <TabsTrigger value="range" className="text-[10px] gap-1 flex-1 min-w-0">
            <SlidersHorizontal className="h-2.5 w-2.5" />
            Range ({buckets.customRange.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 mt-3">
          {activities.length === 0 ? <EmptyState /> : activities.map((a) => (
            <BucketItem key={a.id} activity={a} onEdit={onEdit} onDelete={onDelete} groupColor={a.group_id ? groups.find(g => g.id === a.group_id)?.color_hex : undefined} />
          ))}
        </TabsContent>

        <TabsContent value="general" className="space-y-2 mt-3">
          {buckets.general.length === 0 ? <EmptyState label="No general items" /> : buckets.general.map((a) => (
            <BucketItem key={a.id} activity={a} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TabsContent>

        <TabsContent value="week" className="space-y-2 mt-3">
          {buckets.thisWeek.length === 0 ? <EmptyState label="No items this week" /> : buckets.thisWeek.map((a) => (
            <BucketItem key={a.id} activity={a} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TabsContent>

        <TabsContent value="month" className="space-y-2 mt-3">
          {buckets.thisMonth.length === 0 ? <EmptyState label="No items for this month" /> : buckets.thisMonth.map((a) => (
            <BucketItem key={a.id} activity={a} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TabsContent>

        <TabsContent value="range" className="space-y-2 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Next</span>
            <Input
              type="number"
              min={1}
              max={12}
              value={rangeWeeks}
              onChange={(e) => setRangeWeeks(parseInt(e.target.value) || 2)}
              className="h-7 w-14 text-xs"
            />
            <span className="text-xs text-muted-foreground">weeks</span>
          </div>
          {buckets.customRange.length === 0 ? <EmptyState label="No items in this range" /> : buckets.customRange.map((a) => (
            <BucketItem key={a.id} activity={a} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ label = "No unscheduled items" }: { label?: string }) {
  return (
    <div className="text-center py-6">
      <Clock className="h-6 w-6 mx-auto text-muted-foreground/50 mb-2" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
