import { type ActivityGroup } from "@/types/activity";

export function getGroupColor(groupId: string | null, groups: ActivityGroup[]): string | null {
  if (!groupId) return null;
  const group = groups.find((g) => g.id === groupId);
  return group?.color_hex || null;
}

export function getGroupBadgeStyle(groupId: string | null, groups: ActivityGroup[]): React.CSSProperties {
  const color = getGroupColor(groupId, groups);
  if (!color) return {};
  return {
    borderLeftColor: color,
  };
}

export function getGroupTint(groupId: string | null, groups: ActivityGroup[]): string {
  const color = getGroupColor(groupId, groups);
  if (!color) return "";
  return `border-l-[3px]`;
}
