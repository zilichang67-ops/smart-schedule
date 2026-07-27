"use client";

import { useState, useCallback } from "react";

export type Timezone = string;

const ALL_TIMEZONES: { value: string; label: string; offset: string }[] = [
  // Americas
  { value: "Pacific/Honolulu", label: "Hawaii", offset: "UTC-10" },
  { value: "America/Adak", label: "Adak", offset: "UTC-10" },
  { value: "America/Anchorage", label: "Alaska", offset: "UTC-9" },
  { value: "America/Juneau", label: "Juneau", offset: "UTC-9" },
  { value: "America/Nome", label: "Nome", offset: "UTC-9" },
  { value: "America/Yakutat", label: "Yakutat", offset: "UTC-9" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)", offset: "UTC-8" },
  { value: "America/Vancouver", label: "Vancouver", offset: "UTC-8" },
  { value: "America/Tijuana", label: "Tijuana", offset: "UTC-8" },
  { value: "America/Dawson", label: "Dawson", offset: "UTC-7" },
  { value: "America/Denver", label: "Mountain Time (US)", offset: "UTC-7" },
  { value: "America/Phoenix", label: "Phoenix", offset: "UTC-7" },
  { value: "America/Edmonton", label: "Edmonton", offset: "UTC-7" },
  { value: "America/Chicago", label: "Central Time (US)", offset: "UTC-6" },
  { value: "America/Mexico_City", label: "Mexico City", offset: "UTC-6" },
  { value: "America/Winnipeg", label: "Winnipeg", offset: "UTC-6" },
  { value: "America/New_York", label: "Eastern Time (US)", offset: "UTC-5" },
  { value: "America/Toronto", label: "Toronto", offset: "UTC-5" },
  { value: "America/Havana", label: "Havana", offset: "UTC-5" },
  { value: "America/Indiana/Indianapolis", label: "Indianapolis", offset: "UTC-5" },
  { value: "America/Caracas", label: "Caracas", offset: "UTC-4" },
  { value: "America/Barbados", label: "Barbados", offset: "UTC-4" },
  { value: "America/Halifax", label: "Halifax", offset: "UTC-4" },
  { value: "America/Puerto_Rico", label: "Puerto Rico", offset: "UTC-4" },
  { value: "America/Manaus", label: "Manaus", offset: "UTC-4" },
  { value: "America/Santiago", label: "Santiago", offset: "UTC-4" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires", offset: "UTC-3" },
  { value: "America/Sao_Paulo", label: "São Paulo", offset: "UTC-3" },
  { value: "America/Montevideo", label: "Montevideo", offset: "UTC-3" },
  { value: "America/Godthab", label: "Nuuk", offset: "UTC-3" },
  { value: "America/Noronha", label: "Noronha", offset: "UTC-2" },

  // Atlantic / Europe
  { value: "Atlantic/Azores", label: "Azores", offset: "UTC-1" },
  { value: "Atlantic/Cape_Verde", label: "Cape Verde", offset: "UTC-1" },
  { value: "Europe/London", label: "London", offset: "UTC+0" },
  { value: "Europe/Dublin", label: "Dublin", offset: "UTC+0" },
  { value: "Atlantic/Reykjavik", label: "Reykjavik", offset: "UTC+0" },
  { value: "Africa/Abidjan", label: "Abidjan", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris", offset: "UTC+1" },
  { value: "Europe/Berlin", label: "Berlin", offset: "UTC+1" },
  { value: "Europe/Rome", label: "Rome", offset: "UTC+1" },
  { value: "Europe/Madrid", label: "Madrid", offset: "UTC+1" },
  { value: "Europe/Amsterdam", label: "Amsterdam", offset: "UTC+1" },
  { value: "Europe/Brussels", label: "Brussels", offset: "UTC+1" },
  { value: "Africa/Lagos", label: "Lagos", offset: "UTC+1" },
  { value: "Africa/Algiers", label: "Algiers", offset: "UTC+1" },
  { value: "Europe/Bucharest", label: "Bucharest", offset: "UTC+2" },
  { value: "Europe/Athens", label: "Athens", offset: "UTC+2" },
  { value: "Europe/Helsinki", label: "Helsinki", offset: "UTC+2" },
  { value: "Europe/Istanbul", label: "Istanbul", offset: "UTC+3" },
  { value: "Africa/Cairo", label: "Cairo", offset: "UTC+2" },
  { value: "Africa/Johannesburg", label: "Johannesburg", offset: "UTC+2" },
  { value: "Europe/Moscow", label: "Moscow", offset: "UTC+3" },
  { value: "Asia/Riyadh", label: "Riyadh", offset: "UTC+3" },
  { value: "Asia/Baghdad", label: "Baghdad", offset: "UTC+3" },
  { value: "Asia/Tehran", label: "Tehran", offset: "UTC+3:30" },
  { value: "Asia/Dubai", label: "Dubai", offset: "UTC+4" },
  { value: "Asia/Baku", label: "Baku", offset: "UTC+4" },
  { value: "Asia/Tbilisi", label: "Tbilisi", offset: "UTC+4" },
  { value: "Asia/Yerevan", label: "Yerevan", offset: "UTC+4" },
  { value: "Asia/Karachi", label: "Karachi", offset: "UTC+5" },
  { value: "Asia/Tashkent", label: "Tashkent", offset: "UTC+5" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
  { value: "Asia/Colombo", label: "Colombo", offset: "UTC+5:30" },
  { value: "Asia/Kathmandu", label: "Kathmandu", offset: "UTC+5:45" },
  { value: "Asia/Dhaka", label: "Dhaka", offset: "UTC+6" },
  { value: "Asia/Almaty", label: "Almaty", offset: "UTC+6" },
  { value: "Asia/Yangon", label: "Yangon", offset: "UTC+6:30" },
  { value: "Asia/Bangkok", label: "Bangkok", offset: "UTC+7" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh", offset: "UTC+7" },
  { value: "Asia/Jakarta", label: "Jakarta", offset: "UTC+7" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", offset: "UTC+8" },
  { value: "Asia/Singapore", label: "Singapore", offset: "UTC+8" },
  { value: "Asia/Taipei", label: "Taipei", offset: "UTC+8" },
  { value: "Asia/Perth", label: "Perth", offset: "UTC+8" },
  { value: "Asia/Manila", label: "Manila", offset: "UTC+8" },
  { value: "Asia/Seoul", label: "Seoul", offset: "UTC+9" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Pyongyang", label: "Pyongyang", offset: "UTC+9" },
  { value: "Australia/Adelaide", label: "Adelaide", offset: "UTC+9:30" },
  { value: "Australia/Darwin", label: "Darwin", offset: "UTC+9:30" },
  { value: "Australia/Sydney", label: "Sydney", offset: "UTC+11" },
  { value: "Australia/Melbourne", label: "Melbourne", offset: "UTC+11" },
  { value: "Australia/Brisbane", label: "Brisbane", offset: "UTC+10" },
  { value: "Australia/Perth", label: "Perth (AWST)", offset: "UTC+8" },
  { value: "Pacific/Guam", label: "Guam", offset: "UTC+10" },
  { value: "Pacific/Port_Moresby", label: "Port Moresby", offset: "UTC+10" },
  { value: "Pacific/Auckland", label: "Auckland", offset: "UTC+13" },
  { value: "Pacific/Fiji", label: "Fiji", offset: "UTC+12" },
  { value: "Pacific/Tongatapu", label: "Tonga", offset: "UTC+13" },
];

export function getAllTimezones() {
  return ALL_TIMEZONES;
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
  const tz = ALL_TIMEZONES.find((t) => t.value === timezone);
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
