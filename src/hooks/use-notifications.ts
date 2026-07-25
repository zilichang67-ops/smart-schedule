"use client";

import { useState, useEffect, useCallback } from "react";
import { type Activity } from "@/types/activity";

function getInitialPermission(): NotificationPermission {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "default";
}

export function useNotifications(activities: Activity[]) {
  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      for (const activity of activities) {
        if (!activity.is_scheduled || !activity.start_time || !activity.activity_date) continue;
        if (!activity.reminder_trigger_minutes) continue;

        const [h, m] = activity.start_time.split(":").map(Number);
        const activityTime = new Date(activity.activity_date);
        activityTime.setHours(h, m, 0, 0);

        const triggerTime = new Date(activityTime.getTime() - activity.reminder_trigger_minutes * 60000);
        const diffMs = Math.abs(now.getTime() - triggerTime.getTime());

        if (diffMs < 30000) {
          new Notification(`Reminder: ${activity.title}`, {
            body: `Starts at ${activity.start_time} on ${activity.activity_date}`,
            icon: "/favicon.ico",
            tag: `reminder-${activity.id}`,
          });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [permission, activities]);

  return { permission, requestPermission };
}
