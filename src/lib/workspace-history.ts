import type {ToolSlug} from "@/config/tools";

export type WorkspaceArtifactType = "draft" | "export" | "conversion" | "ai-output" | "share";

export type WorkspaceHistoryEntry = {
  toolSlug: ToolSlug | string;
  updatedAt: number;
  sourcePreview: string;
  source: string;
  artifactType: WorkspaceArtifactType | string;
};

export const workspaceDraftsStorageKey = "diagrampreview.workspaceDrafts";
export const exportHistoryStorageKey = "diagrampreview.exportHistory";
export const conversionHistoryStorageKey = "diagrampreview.conversionHistory";

const maxHistoryEntries = 12;
const sourcePreviewLength = 120;

export function readWorkspaceDraft(storage: Storage, toolSlug: ToolSlug | string): WorkspaceHistoryEntry | null {
  return readHistory(storage, workspaceDraftsStorageKey).find((entry) => entry.toolSlug === toolSlug) ?? null;
}

export function recordWorkspaceDraft(storage: Storage, entry: Omit<WorkspaceHistoryEntry, "updatedAt" | "sourcePreview">, now = Date.now()) {
  if (!entry.source.trim()) {
    removeWorkspaceDraft(storage, entry.toolSlug);
    return;
  }

  writeHistory(storage, workspaceDraftsStorageKey, upsertEntry(readHistory(storage, workspaceDraftsStorageKey), entry, now));
}

export function removeWorkspaceDraft(storage: Storage, toolSlug: ToolSlug | string) {
  writeHistory(
    storage,
    workspaceDraftsStorageKey,
    readHistory(storage, workspaceDraftsStorageKey).filter((entry) => entry.toolSlug !== toolSlug)
  );
}

export function readExportHistory(storage: Storage) {
  return readHistory(storage, exportHistoryStorageKey);
}

export function recordExportHistory(storage: Storage, entry: Omit<WorkspaceHistoryEntry, "updatedAt" | "sourcePreview">, now = Date.now()) {
  if (!entry.source.trim()) return;
  writeHistory(storage, exportHistoryStorageKey, upsertEntry(readHistory(storage, exportHistoryStorageKey), entry, now));
}

export function readConversionHistory(storage: Storage) {
  return readHistory(storage, conversionHistoryStorageKey);
}

export function recordConversionHistory(storage: Storage, entry: Omit<WorkspaceHistoryEntry, "updatedAt" | "sourcePreview">, now = Date.now()) {
  if (!entry.source.trim()) return;
  writeHistory(storage, conversionHistoryStorageKey, upsertEntry(readHistory(storage, conversionHistoryStorageKey), entry, now));
}

function readHistory(storage: Storage, key: string): WorkspaceHistoryEntry[] {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isWorkspaceHistoryEntry)
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, maxHistoryEntries);
  } catch {
    return [];
  }
}

function writeHistory(storage: Storage, key: string, entries: WorkspaceHistoryEntry[]) {
  storage.setItem(key, JSON.stringify(entries.slice(0, maxHistoryEntries)));
}

function upsertEntry(
  entries: WorkspaceHistoryEntry[],
  entry: Omit<WorkspaceHistoryEntry, "updatedAt" | "sourcePreview">,
  now: number
) {
  const nextEntry: WorkspaceHistoryEntry = {
    ...entry,
    updatedAt: now,
    sourcePreview: toSourcePreview(entry.source)
  };

  return [nextEntry]
    .concat(entries.filter((item) => item.toolSlug !== entry.toolSlug || item.artifactType !== entry.artifactType))
    .slice(0, maxHistoryEntries);
}

function isWorkspaceHistoryEntry(value: unknown): value is WorkspaceHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<WorkspaceHistoryEntry>;

  return (
    typeof entry.toolSlug === "string" &&
    typeof entry.updatedAt === "number" &&
    typeof entry.sourcePreview === "string" &&
    typeof entry.source === "string" &&
    typeof entry.artifactType === "string"
  );
}

function toSourcePreview(source: string) {
  return source.replace(/\s+/g, " ").trim().slice(0, sourcePreviewLength);
}
