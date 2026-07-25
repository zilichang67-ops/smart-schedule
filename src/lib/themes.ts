import { type SceneTheme, type SceneThemeId } from "@/types/activity";

export const SCENE_THEMES: Record<SceneThemeId, SceneTheme> = {
  indigo: {
    id: "indigo",
    name: "Default Indigo",
    accent: "#6366f1",
    accentLight: "#818cf8",
    bg: "oklch(0.13 0.015 280)",
    card: "oklch(0.17 0.015 280)",
    border: "oklch(1 0 0 / 10%)",
  },
  ocean: {
    id: "ocean",
    name: "Cool Ocean",
    accent: "#06b6d4",
    accentLight: "#22d3ee",
    bg: "oklch(0.13 0.02 210)",
    card: "oklch(0.17 0.02 210)",
    border: "oklch(1 0 0 / 10%)",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Amber",
    accent: "#f59e0b",
    accentLight: "#fbbf24",
    bg: "oklch(0.14 0.02 60)",
    card: "oklch(0.18 0.02 60)",
    border: "oklch(1 0 0 / 10%)",
  },
  forest: {
    id: "forest",
    name: "Forest Moss",
    accent: "#22c55e",
    accentLight: "#4ade80",
    bg: "oklch(0.13 0.02 150)",
    card: "oklch(0.17 0.02 150)",
    border: "oklch(1 0 0 / 10%)",
  },
  amethyst: {
    id: "amethyst",
    name: "Deep Amethyst",
    accent: "#a855f7",
    accentLight: "#c084fc",
    bg: "oklch(0.14 0.025 310)",
    card: "oklch(0.18 0.025 310)",
    border: "oklch(1 0 0 / 10%)",
  },
};

const THEME_HUES: Record<SceneThemeId, number> = {
  indigo: 280,
  ocean: 210,
  sunset: 60,
  forest: 150,
  amethyst: 310,
};

function buildThemeCSS(hue: number, isDark: boolean): string {
  if (isDark) {
    return `
      html.dark {
        --background: oklch(0.13 0.015 ${hue}) !important;
        --foreground: oklch(0.97 0 0) !important;
        --card: oklch(0.17 0.015 ${hue}) !important;
        --card-foreground: oklch(0.97 0 0) !important;
        --popover: oklch(0.17 0.015 ${hue}) !important;
        --popover-foreground: oklch(0.97 0 0) !important;
        --primary: oklch(0.65 0.2 ${hue}) !important;
        --primary-foreground: oklch(0.98 0 0) !important;
        --secondary: oklch(0.22 0.015 ${hue}) !important;
        --secondary-foreground: oklch(0.97 0 0) !important;
        --muted: oklch(0.22 0.015 ${hue}) !important;
        --muted-foreground: oklch(0.65 0.02 ${hue}) !important;
        --accent: oklch(0.22 0.015 ${hue}) !important;
        --accent-foreground: oklch(0.97 0 0) !important;
        --ring: oklch(0.65 0.2 ${hue}) !important;
        --border: oklch(1 0 0 / 10%) !important;
        --input: oklch(1 0 0 / 15%) !important;
        --chart-1: oklch(0.65 0.2 ${hue}) !important;
        --chart-2: oklch(0.7 0.18 ${hue + 20}) !important;
        --chart-3: oklch(0.6 0.22 ${hue - 20}) !important;
        --chart-4: oklch(0.55 0.15 ${hue + 30}) !important;
        --chart-5: oklch(0.5 0.12 ${hue + 10}) !important;
        --sidebar: oklch(0.15 0.015 ${hue}) !important;
        --sidebar-foreground: oklch(0.97 0 0) !important;
        --sidebar-primary: oklch(0.65 0.2 ${hue}) !important;
        --sidebar-primary-foreground: oklch(0.98 0 0) !important;
        --sidebar-accent: oklch(0.22 0.015 ${hue}) !important;
        --sidebar-accent-foreground: oklch(0.97 0 0) !important;
        --sidebar-border: oklch(1 0 0 / 10%) !important;
        --sidebar-ring: oklch(0.556 0 0) !important;
      }
    `;
  }
  return `
    html:not(.dark) {
      --background: oklch(0.98 0.003 ${hue}) !important;
      --foreground: oklch(0.15 0.01 ${hue}) !important;
      --card: oklch(1 0 0) !important;
      --card-foreground: oklch(0.15 0.01 ${hue}) !important;
      --popover: oklch(1 0 0) !important;
      --popover-foreground: oklch(0.15 0.01 ${hue}) !important;
      --primary: oklch(0.55 0.2 ${hue}) !important;
      --primary-foreground: oklch(0.98 0 0) !important;
      --secondary: oklch(0.95 0.01 ${hue}) !important;
      --secondary-foreground: oklch(0.2 0.01 ${hue}) !important;
      --muted: oklch(0.95 0.01 ${hue}) !important;
      --muted-foreground: oklch(0.5 0.02 ${hue}) !important;
      --accent: oklch(0.95 0.01 ${hue}) !important;
      --accent-foreground: oklch(0.2 0.01 ${hue}) !important;
      --ring: oklch(0.55 0.2 ${hue}) !important;
      --border: oklch(0.88 0.005 ${hue}) !important;
      --input: oklch(0.88 0.005 ${hue}) !important;
      --chart-1: oklch(0.55 0.2 ${hue}) !important;
      --chart-2: oklch(0.6 0.18 ${hue + 20}) !important;
      --chart-3: oklch(0.5 0.22 ${hue - 20}) !important;
      --chart-4: oklch(0.45 0.15 ${hue + 30}) !important;
      --chart-5: oklch(0.4 0.12 ${hue + 10}) !important;
      --sidebar: oklch(0.97 0.005 ${hue}) !important;
      --sidebar-primary: oklch(0.55 0.2 ${hue}) !important;
      --sidebar-accent: oklch(0.95 0.01 ${hue}) !important;
      --sidebar-border: oklch(0.88 0.005 ${hue}) !important;
      --sidebar-ring: oklch(0.55 0.2 ${hue}) !important;
    }
  `;
}

const STYLE_ID = "scene-theme-overrides";

export function applySceneTheme(themeId: SceneThemeId) {
  if (typeof document === "undefined") return;

  const hue = THEME_HUES[themeId];
  const isDark = document.documentElement.classList.contains("dark");

  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = buildThemeCSS(hue, isDark);
}

const PALETTE_HUES: Record<SceneThemeId, number[]> = {
  indigo: [240, 260, 280, 300, 220, 200],
  ocean: [190, 210, 170, 230, 250, 160],
  sunset: [20, 40, 60, 350, 10, 50],
  forest: [130, 150, 110, 170, 90, 120],
  amethyst: [280, 300, 260, 320, 240, 270],
};

export function getAdjacentColors(
  activities: { id: string; activity_date: string; start_time: string | null }[],
  themeId: SceneThemeId
): Map<string, string> {
  const hues = PALETTE_HUES[themeId] || PALETTE_HUES.indigo;
  const colorMap = new Map<string, string>();

  const byDate: Record<string, typeof activities> = {};
  for (const a of activities) {
    const key = a.activity_date || "none";
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(a);
  }

  for (const dayActs of Object.values(byDate)) {
    const sorted = [...dayActs].sort((a, b) => {
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    });

    let lastHue = -1;
    for (let i = 0; i < sorted.length; i++) {
      let hueIdx = i % hues.length;
      if (hues[hueIdx] === lastHue) {
        hueIdx = (hueIdx + 1) % hues.length;
      }
      colorMap.set(sorted[i].id, `hsl(${hues[hueIdx]}, 60%, 45%)`);
      lastHue = hues[hueIdx];
    }
  }

  return colorMap;
}
