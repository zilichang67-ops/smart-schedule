"use client";

import { useState } from "react";

export interface SleepSettings {
  enabled: boolean;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

const DEFAULT: SleepSettings = {
  enabled: true,
  startHour: 22,
  startMinute: 0,
  endHour: 6,
  endMinute: 0,
};

function load(): SleepSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem("smart-schedule-sleep");
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT;
}

function save(settings: SleepSettings) {
  localStorage.setItem("smart-schedule-sleep", JSON.stringify(settings));
}

export function useSleepSettings() {
  const [settings, setSettings] = useState<SleepSettings>(DEFAULT);

  const init = () => setSettings(load());

  const update = (patch: Partial<SleepSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    save(next);
  };

  const reset = () => {
    setSettings(DEFAULT);
    save(DEFAULT);
  };

  const isAsleep = (hour: number): boolean => {
    if (!settings.enabled) return false;
    const start = settings.startHour + settings.startMinute / 60;
    const end = settings.endHour + settings.endMinute / 60;
    if (start > end) {
      return hour >= start || hour < end;
    }
    return hour >= start && hour < end;
  };

  return { settings, update, reset, isAsleep, init };
}
