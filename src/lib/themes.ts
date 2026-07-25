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

export function applySceneTheme(themeId: SceneThemeId) {
  const theme = SCENE_THEMES[themeId];
  const root = document.documentElement;
  root.style.setProperty("--scene-accent", theme.accent);
  root.style.setProperty("--scene-accent-light", theme.accentLight);
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
