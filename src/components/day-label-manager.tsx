"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { type DayLabel } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  user: User;
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: DayLabel[];
  onLabelsChange: (labels: DayLabel[]) => void;
}

const LABEL_COLORS = [
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
];

export function DayLabelManager({ user, date, open, onOpenChange, labels, onLabelsChange }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(LABEL_COLORS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const supabase = createClient();
  const dateStr = format(date, "yyyy-MM-dd");

  const dayLabels = labels.filter((l) => l.label_date === dateStr);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const { data } = await supabase
      .from("day_labels")
      .insert({ user_id: user.id, label_date: dateStr, title: newTitle.trim(), color: newColor })
      .select();
    if (data) {
      onLabelsChange([...labels, ...data]);
      setNewTitle("");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;
    const { error } = await supabase.from("day_labels").update({ title: editTitle.trim() }).eq("id", id);
    if (!error) {
      onLabelsChange(labels.map((l) => (l.id === id ? { ...l, title: editTitle.trim() } : l)));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("day_labels").delete().eq("id", id);
    if (!error) {
      onLabelsChange(labels.filter((l) => l.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-amber-500" />
            Labels for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Birthday, Holiday, Exam"
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${newColor === c.value ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setNewColor(c.value)}
                />
              ))}
            </div>
          </div>

          {dayLabels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No labels for this day</p>
          ) : (
            <div className="space-y-2">
              {dayLabels.map((label) => (
                <Card key={label.id} className="border-border/50">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                    {editingId === label.id ? (
                      <div className="flex gap-1 flex-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-xs"
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate(label.id)}
                          autoFocus
                        />
                        <Button size="sm" className="h-7" onClick={() => handleUpdate(label.id)}>Save</Button>
                      </div>
                    ) : (
                      <span className="flex-1 text-sm">{label.title}</span>
                    )}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingId(label.id); setEditTitle(label.title); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-destructive" onClick={() => handleDelete(label.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
