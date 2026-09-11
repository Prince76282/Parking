/**
 * Persistence adapter — localStorage backed attempt store.
 *
 * All platform state is serialised here. Swapping to a remote API
 * only requires implementing the same interface.
 */

import type { Attempt } from "@/lib/domain/types";

const STORAGE_KEY = "lld-attempts-v1";

export interface AttemptStore {
  load(): Attempt[];
  save(attempts: Attempt[]): void;
}

/**
 * Browser localStorage adapter.
 * Safe to call server-side (returns empty array, save is a no-op).
 */
export class LocalAttemptStore implements AttemptStore {
  load(): Attempt[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Attempt[];
    } catch {
      return [];
    }
  }

  save(attempts: Attempt[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch {
      // Storage quota exceeded or private mode — silently ignore
    }
  }
}

export const defaultStore: AttemptStore = new LocalAttemptStore();
