"use client";

import { type ConflictInfo } from "@/components/schedule-dashboard";
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

interface Props {
  conflict: ConflictInfo;
  onResolve: (keepBoth: boolean) => void;
  onClose: () => void;
}

export function ConflictModal({ conflict, onResolve, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            Time Conflict
          </DialogTitle>
          <DialogDescription>
            Two activities overlap on your timeline. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border border-border/50 p-3 space-y-1">
            <p className="text-sm font-medium">Existing: {conflict.existing.title}</p>
            <p className="text-xs text-muted-foreground">
              {conflict.existing.start_time} - {conflict.existing.end_time}
            </p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
            <p className="text-sm font-medium">New: {conflict.incoming.title}</p>
            <p className="text-xs text-muted-foreground">
              {conflict.incoming.start_time} - {conflict.incoming.end_time}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={() => onResolve(true)}
            className="w-full"
            variant="outline"
          >
            Keep Both Activities
          </Button>
          <Button
            onClick={() => onResolve(false)}
            className="w-full"
            variant="destructive"
          >
            Delete Existing & Add New
          </Button>
          <Button
            onClick={onClose}
            className="w-full"
            variant="ghost"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
