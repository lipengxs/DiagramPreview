export const favoriteToolsStorageKey = "diagrampreview.favoriteTools";

export function readFavoriteToolSlugs(storage: Storage): string[] {
  try {
    const parsed = JSON.parse(storage.getItem(favoriteToolsStorageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

export function isFavoriteTool(storage: Storage, slug: string) {
  return readFavoriteToolSlugs(storage).includes(slug);
}

export function setFavoriteTool(storage: Storage, slug: string, favorite: boolean) {
  const existing = readFavoriteToolSlugs(storage).filter((candidate) => candidate !== slug);
  const nextSlugs = favorite ? [slug].concat(existing).slice(0, 16) : existing;
  storage.setItem(favoriteToolsStorageKey, JSON.stringify(nextSlugs));
  window.dispatchEvent(new CustomEvent("diagrampreview:favorites-updated"));
}
