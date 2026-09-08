// Robust local save with rotating backups, debounced auto-save and
// page-unload flush. Used as a drop-in replacement for the previous
// inline localStorage read/write in src/routes/index.tsx.
//
// Layout in localStorage:
//   rubym.save.v2          -> latest save
//   rubym.save.bak.1       -> most recent backup
//   rubym.save.bak.2       -> previous
//   rubym.save.bak.3       -> oldest kept
//
// Each backup is a JSON envelope: { savedAt: number, data: <SaveState> }.

import { toast } from "sonner";
import { scheduleCloudSync } from "@/lib/cloudSave";

export const SAVE_KEY = "rubym.save.v2";
const BACKUP_KEYS = ["rubym.save.bak.1", "rubym.save.bak.2", "rubym.save.bak.3"] as const;
const DEBOUNCE_MS = 600;

type Envelope<T> = { savedAt: number; data: T };

let pending: unknown = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastSerialized: string | null = null;
let initialized = false;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function rotateBackups(serialized: string) {
  try {
    // shift bak.2 -> bak.3, bak.1 -> bak.2, current -> bak.1
    const b1 = localStorage.getItem(BACKUP_KEYS[0]);
    const b2 = localStorage.getItem(BACKUP_KEYS[1]);
    if (b2) localStorage.setItem(BACKUP_KEYS[2], b2);
    if (b1) localStorage.setItem(BACKUP_KEYS[1], b1);
    const env: Envelope<unknown> = { savedAt: Date.now(), data: JSON.parse(serialized) };
    localStorage.setItem(BACKUP_KEYS[0], JSON.stringify(env));
  } catch { /* ignore */ }
}

/**
 * Reads the latest valid save. Falls back to backups if the primary
 * slot is missing or corrupted (e.g. crash mid-write, quota error).
 */
export function loadLatestValid<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const primary = safeParse<T>(localStorage.getItem(SAVE_KEY));
  if (primary) return primary;
  for (const k of BACKUP_KEYS) {
    const env = safeParse<Envelope<T>>(localStorage.getItem(k));
    if (env?.data) {
      console.warn(`[localSave] restored from backup ${k}`);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(env.data)); } catch { /* ignore */ }
      return env.data;
    }
  }
  return null;
}

function flush() {
  if (typeof window === "undefined" || pending == null) return;
  try {
    const serialized = JSON.stringify(pending);
    if (serialized === lastSerialized) { pending = null; return; }
    localStorage.setItem(SAVE_KEY, serialized);
    rotateBackups(serialized);
    lastSerialized = serialized;
    try { scheduleCloudSync(pending); } catch { /* ignore */ }
  } catch (e) {
    console.warn("[localSave] flush failed", e);
  } finally {
    pending = null;
  }
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const onFlush = () => { if (timer) { clearTimeout(timer); timer = null; } flush(); };
  window.addEventListener("beforeunload", onFlush);
  window.addEventListener("pagehide", onFlush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onFlush();
  });
}

/** Debounced save. Persists ~600ms after the last call. */
export function saveNow(state: unknown) {
  if (typeof window === "undefined") return;
  ensureInit();
  pending = state;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, DEBOUNCE_MS);
}

/** Manual save invoked from a UI button. Bypasses debounce and toasts. */
export function manualSave(state: unknown) {
  if (typeof window === "undefined") return;
  ensureInit();
  pending = state;
  if (timer) { clearTimeout(timer); timer = null; }
  flush();
  try { toast.success("Jogo salvo!"); } catch { /* ignore */ }
}

/** Exports the current save as a JSON string (for future export button). */
export function exportSave(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SAVE_KEY);
}

/** Imports a JSON save string. Returns true if valid JSON was written. */
export function importSave(json: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(json);
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    rotateBackups(JSON.stringify(parsed));
    return true;
  } catch { return false; }
}