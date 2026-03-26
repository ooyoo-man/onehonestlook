import { eachDayOfInterval, endOfWeek, format, startOfWeek, subDays } from 'date-fns';
import type { Bubble, Log } from '../types';
import { logKey, todayStr } from './helpers';

export type MilestoneDay = 7 | 30 | 60 | 100;

export const STREAK_MILESTONES: MilestoneDay[] = [7, 30, 60, 100];

export function isDayCompleted(
  bubbles: Bubble[],
  logs: Record<string, Log>,
  dateStr: string
): boolean {
  if (bubbles.length === 0) return false;
  return bubbles.some((b) => {
    const entry = logs[logKey(b.id, dateStr)];
    return entry?.yn === 'yes';
  });
}

export function getCurrentGlobalStreak(
  bubbles: Bubble[],
  logs: Record<string, Log>
): number {
  if (bubbles.length === 0) return 0;
  const today = new Date(todayStr() + 'T12:00:00');
  let streak = 0;
  const cursor = new Date(today);
  for (;;) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (isDayCompleted(bubbles, logs, dateStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

/** First calendar day (ISO) of the current streak run; null if streak is 0. */
export function getStreakRunStartDateStr(streak: number): string | null {
  if (streak <= 0) return null;
  const today = new Date(todayStr() + 'T12:00:00');
  const start = new Date(today);
  start.setDate(today.getDate() - (streak - 1));
  return start.toISOString().slice(0, 10);
}

/** % of the last 30 calendar days (including today) with at least one habit marked yes. */
export function getSuccessRateLast30Days(
  bubbles: Bubble[],
  logs: Record<string, Log>
): number | null {
  if (bubbles.length === 0) return null;
  const today = new Date(todayStr() + 'T12:00:00');
  let completed = 0;
  for (let i = 0; i < 30; i++) {
    const d = subDays(today, i);
    const dateStr = d.toISOString().slice(0, 10);
    if (isDayCompleted(bubbles, logs, dateStr)) completed += 1;
  }
  return Math.round((completed / 30) * 100);
}

export interface WeekSummaryStats {
  /** Mon–Sun inclusive */
  completedDays: number;
  totalDays: number;
  bestStreakInWeek: number;
  /** Human range e.g. "Mar 3–9, 2025" */
  rangeLabel: string;
}

/** Calendar week Monday–Sunday containing `referenceDate` (local). */
export function getWeekSummary(
  bubbles: Bubble[],
  logs: Record<string, Log>,
  referenceDate: Date
): WeekSummaryStats | null {
  if (bubbles.length === 0) return null;
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const totalDays = days.length;

  let completedDays = 0;
  let run = 0;
  let bestStreakInWeek = 0;

  for (const d of days) {
    const dateStr = format(d, 'yyyy-MM-dd');
    if (isDayCompleted(bubbles, logs, dateStr)) {
      completedDays += 1;
      run += 1;
      if (run > bestStreakInWeek) bestStreakInWeek = run;
    } else {
      run = 0;
    }
  }

  const y = weekEnd.getFullYear();
  const rangeLabel =
    weekStart.getFullYear() === y
      ? `${format(weekStart, 'MMM d')}–${format(weekEnd, 'd, yyyy')}`
      : `${format(weekStart, 'MMM d, yyyy')} – ${format(weekEnd, 'MMM d, yyyy')}`;

  return {
    completedDays,
    totalDays,
    bestStreakInWeek,
    rangeLabel,
  };
}

const MILESTONE_STORAGE_KEY = 'ohl3-streak-milestones-v1';

type MilestoneStore = Record<string, string[]>;

function readMilestoneStore(): MilestoneStore {
  try {
    const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MilestoneStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function hasCelebratedStreakMilestone(runStart: string, milestone: MilestoneDay): boolean {
  const list = readMilestoneStore()[runStart];
  return Array.isArray(list) && list.includes(String(milestone));
}

export function recordStreakMilestoneCelebration(runStart: string, milestone: MilestoneDay): void {
  const store = readMilestoneStore();
  const prev = store[runStart] ?? [];
  if (prev.includes(String(milestone))) return;
  store[runStart] = [...prev, String(milestone)].sort(
    (a, b) => Number(a) - Number(b)
  );
  localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(store));
}

/** Smallest milestone in STREAK_MILESTONES that applies and has not been celebrated for this run. */
export function getNextMilestoneToCelebrate(
  streak: number,
  runStart: string | null
): MilestoneDay | null {
  if (!runStart || streak <= 0) return null;
  for (const m of STREAK_MILESTONES) {
    if (streak >= m && !hasCelebratedStreakMilestone(runStart, m)) return m;
  }
  return null;
}
