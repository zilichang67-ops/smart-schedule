"use client";

import { useState, useCallback } from "react";

export type Timezone = string;

const COMMON_TIMEZONES: { value: string; label: string; offset: string }[] = [
  { value: "Pacific/Honolulu", label: "Hawaii (HST)", offset: "UTC-10" },
  { value: "America/Anchorage", label: "Alaska (AKST)", offset: "UTC-9" },
  { value: "America/Los_Angeles", label: "Pacific (PT)", offset: "UTC-8" },
  { value: "America/Denver", label: "Mountain (MT)", offset: "UTC-7" },
  { value: "America/Chicago", label: "Central (CT)", offset: "UTC-6" },
  { value: "America/New_York", label: "Eastern (ET)", offset: "UTC-5" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", offset: "UTC-3" },
  { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)", offset: "UTC+3" },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: "UTC+7" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Australia/Sydney", label: "Sydney (AEST)", offset: "UTC+11" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)", offset: "UTC+13" },
];

export function getCommonTimezones() {
  return COMMON_TIMEZONES;
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function formatTimeInZone(time: string, timezone: string): string {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  try {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  } catch {
    return time;
  }
}

export function getTimezoneOffset(timezone: string): string {
  const tz = COMMON_TIMEZONES.find((t) => t.value === timezone);
  return tz?.offset || "UTC";
}

function getInitialTimezone(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("smart-schedule-tz");
    if (saved) return saved;
  }
  return detectTimezone();
}

export function useTimezone() {
  const [timezone, setTimezoneState] = useState<string>(getInitialTimezone);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem("smart-schedule-tz", tz);
  }, []);

  const initTimezone = useCallback((savedTz: string | null) => {
    if (savedTz) {
      setTimezoneState(savedTz);
      localStorage.setItem("smart-schedule-tz", savedTz);
    }
  }, []);

  return { timezone, setTimezone, initTimezone, detectTimezone };
}
