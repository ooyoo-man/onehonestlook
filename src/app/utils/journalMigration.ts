import type { JournalEntry } from '../types';

/** Map localStorage values to JournalEntry (handles legacy DayReflection). */
export function normalizeJournalRecord(prev: Record<string, unknown>): Record<string, JournalEntry> {
  const next: Record<string, JournalEntry> = {};
  for (const [date, val] of Object.entries(prev)) {
    if (!val || typeof val !== 'object') continue;
    const o = val as Record<string, unknown>;
    if ('body' in o) {
      next[date] = {
        body: String(o.body ?? ''),
        closing: String(o.closing ?? ''),
        updatedAt: String(o.updatedAt ?? new Date().toISOString()),
      };
    } else {
      next[date] = {
        body: String(o.whyMediocre ?? ''),
        closing: String(o.selfForgiveness ?? ''),
        updatedAt: String(o.updatedAt ?? new Date().toISOString()),
      };
    }
  }
  return next;
}
