"use client";

import { useState } from "react";
import { type SleepSettings } from "@/hooks/use-sleep-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Moon, RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SleepSettings;
  onUpdate: (patch: Partial<SleepSettings>) => void;
  onReset: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toTimeString(h: number, m: number): string {
  return `${pad(h)}:${pad(m)}`;
}

function fromTimeString(t: string): { hour: number; minute: number } {
  const [h, m] = t.split(":").map(Number);
  return { hour: h, minute: m };
}

export function SleepSettingsDialog({ open, onOpenChange, settings, onUpdate, onReset }: Props) {
  const [start, setStart] = useState(toTimeString(settings.startHour, settings.startMinute));
  const [end, setEnd] = useState(toTimeString(settings.endHour, settings.endMinute));
  const { t } = useI18n();

  const handleSave = () => {
    const s = fromTimeString(start);
    const e = fromTimeString(end);
    onUpdate({ startHour: s.hour, startMinute: s.minute, endHour: e.hour, endMinute: e.minute });
    onOpenChange(false);
  };

  const handleReset = () => {
    setStart("22:00");
    setEnd("06:00");
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-400" />
            {t.sleepHours}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sleep-enabled">{t.hideSleepBlock}</Label>
            <Switch
              id="sleep-enabled"
              checked={settings.enabled}
              onCheckedChange={(v) => onUpdate({ enabled: v })}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {t.sleepDesc}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sleep-start">{t.sleepStarts}</Label>
              <input
                id="sleep-start"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep-end">{t.wakeUp}</Label>
              <input
                id="sleep-end"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:flex-row">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            {t.resetDefault}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button onClick={handleSave}>{t.save}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
