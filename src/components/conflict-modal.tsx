"use client";

import { type Activity } from "@/types/activity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n/context";

export interface ConflictInfo {
  existing: Activity;
  incoming: Activity;
}

interface Props {
  conflict: ConflictInfo;
  onResolve: (keepBoth: boolean) => void;
  onClose: () => void;
}

export function ConflictModal({ conflict, onResolve, onClose }: Props) {
  const { t } = useI18n();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            {t.timeConflict}
          </DialogTitle>
          <DialogDescription>
            {t.conflictDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border border-border/50 p-3 space-y-1">
            <p className="text-sm font-medium">Existing: {conflict.existing.title}</p>
            <p className="text-xs text-muted-foreground">
              {conflict.existing.activity_date} · {conflict.existing.start_time} - {conflict.existing.end_time}
            </p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
            <p className="text-sm font-medium">New: {conflict.incoming.title}</p>
            <p className="text-xs text-muted-foreground">
              {conflict.incoming.activity_date} · {conflict.incoming.start_time} - {conflict.incoming.end_time}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={() => onResolve(true)} className="w-full" variant="outline">
            {t.keepBoth}
          </Button>
          <Button onClick={() => onResolve(false)} className="w-full" variant="destructive">
            {t.deleteExisting}
          </Button>
          <Button onClick={onClose} className="w-full" variant="ghost">
            {t.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
