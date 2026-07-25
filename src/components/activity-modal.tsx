"use client";

import { useState } from "react";
import { type Activity } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Clock, Repeat } from "lucide-react";

interface Props {
  activity: Activity;
  onSave: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const RECURRENCE_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "DAILY", label: "Every day" },
  { value: "MON,TUE,WED,THU,FRI", label: "Every weekday" },
  { value: "WEEKLY", label: "Weekly (same day)" },
  { value: "MON,WED,FRI", label: "Mon, Wed, Fri" },
  { value: "TUE,THU", label: "Tue, Thu" },
];

function getRecurrenceValue(activity: Activity): string {
  if (!activity.is_recurring) return "never";
  return activity.recurrence_pattern || "WEEKLY";
}

export function ActivityModal({ activity, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(activity.title);
  const [startTime, setStartTime] = useState(activity.start_time || "");
  const [endTime, setEndTime] = useState(activity.end_time || "");
  const [notes, setNotes] = useState(activity.notes || "");
  const [isScheduled, setIsScheduled] = useState(activity.is_scheduled);
  const [activityDate, setActivityDate] = useState(activity.activity_date);
  const [recurrence, setRecurrence] = useState(getRecurrenceValue(activity));

  const handleSave = () => {
    const isRecurring = recurrence !== "never";
    onSave({
      ...activity,
      title,
      start_time: startTime || null,
      end_time: endTime || null,
      notes: notes || null,
      is_scheduled: isScheduled && !!startTime,
      activity_date: activityDate,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrence : null,
    });
  };

  const toggleScheduled = () => {
    if (isScheduled) {
      setIsScheduled(false);
      setStartTime("");
      setEndTime("");
    } else {
      setIsScheduled(true);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Edit Activity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Activity name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant={isScheduled ? "default" : "outline"}
                size="sm"
                onClick={toggleScheduled}
                type="button"
                className="w-full"
              >
                {isScheduled ? "Scheduled" : "Unscheduled"}
              </Button>
            </div>
          </div>

          {isScheduled && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5" />
              Repeat
            </Label>
            <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Location, people, extra details..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:flex-row">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(activity.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
