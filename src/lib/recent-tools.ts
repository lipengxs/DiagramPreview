export type RecentToolEntry = {
  slug: string;
  usedAt: number;
};

export const recentToolsStorageKey = "diagrampreview.recentTools";
const maxRecentTools = 8;

export function readRecentTools(storage: Storage): RecentToolEntry[] {
  try {
    const parsed = JSON.parse(storage.getItem(recentToolsStorageKey) ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is RecentToolEntry => Boolean(entry) && typeof entry.slug === "string" && typeof entry.usedAt === "number")
      .sort((left, right) => right.usedAt - left.usedAt)
      .slice(0, maxRecentTools);
  } catch {
    return [];
  }
}

export function recordRecentTool(storage: Storage, slug: string, now = Date.now()) {
  const nextEntries = [{slug, usedAt: now}]
    .concat(readRecentTools(storage).filter((entry) => entry.slug !== slug))
    .slice(0, maxRecentTools);

  storage.setItem(recentToolsStorageKey, JSON.stringify(nextEntries));
}
