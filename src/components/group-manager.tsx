"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { type ActivityGroup } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FolderTree, Plus, Pencil, Trash2, ChevronDown } from "lucide-react";

interface Props {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: ActivityGroup[];
  onGroupsChange: (groups: ActivityGroup[]) => void;
}

const GROUP_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#22c55e", "#a855f7", "#ef4444", "#ec4899", "#14b8a6"];

export function GroupManager({ user, open, onOpenChange, groups, onGroupsChange }: Props) {
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<string | null>(null);
  const [newColor, setNewColor] = useState(GROUP_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const supabase = createClient();

  const loadGroups = async () => {
    const { data } = await supabase.from("activity_groups").select("*").eq("user_id", user.id).order("name");
    if (data) onGroupsChange(data);
  };

  useEffect(() => {
    if (open) loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { data } = await supabase
      .from("activity_groups")
      .insert({ user_id: user.id, name: newName.trim(), parent_group_id: newParent, color_hex: newColor })
      .select();
    if (data) {
      onGroupsChange([...groups, ...data]);
      setNewName("");
      setNewParent(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase.from("activity_groups").update({ name: editName.trim() }).eq("id", id);
    if (!error) {
      onGroupsChange(groups.map((g) => (g.id === id ? { ...g, name: editName.trim() } : g)));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("activity_groups").delete().eq("id", id);
    if (!error) {
      onGroupsChange(groups.filter((g) => g.id !== id));
    }
  };

  const topLevel = groups.filter((g) => !g.parent_group_id);
  const getChildren = (parentId: string) => groups.filter((g) => g.parent_group_id === parentId);

  const renderGroup = (group: ActivityGroup, depth: number = 0) => {
    const children = getChildren(group.id);
    return (
      <div key={group.id}>
        <div className="flex items-center gap-2 py-1.5" style={{ paddingLeft: depth * 20 }}>
          {children.length > 0 ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          ) : (
            <div className="w-3 shrink-0" />
          )}
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: group.color_hex || "#666" }} />
          {editingId === group.id ? (
            <div className="flex gap-1 flex-1">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-xs" onKeyDown={(e) => e.key === "Enter" && handleUpdate(group.id)} autoFocus />
              <Button size="sm" className="h-7" onClick={() => handleUpdate(group.id)}>Save</Button>
            </div>
          ) : (
            <span className="flex-1 text-sm">{group.name}</span>
          )}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingId(group.id); setEditName(group.name); }}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-destructive" onClick={() => handleDelete(group.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {children.map((child) => renderGroup(child, depth + 1))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Activity Groups
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New group name"
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-5 w-5 rounded-full border-2 ${newColor === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>
            <select
              value={newParent || ""}
              onChange={(e) => setNewParent(e.target.value || null)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">No parent (top-level)</option>
              {topLevel.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-3">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No groups yet. Create one above.</p>
              ) : (
                <div className="space-y-0.5">
                  {topLevel.map((g) => renderGroup(g))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
