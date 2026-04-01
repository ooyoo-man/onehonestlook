import { useMemo, useState } from 'react';
import { Bubble, Log } from '../types';
import { todayStr, logKey, mkDate } from '../utils/helpers';
import {
  getCurrentGlobalStreak,
  getNextMilestoneToCelebrate,
  getStreakRunStartDateStr,
  getSuccessRateLast30Days,
  getWeekSummary,
  recordStreakMilestoneCelebration,
} from '../utils/streakMetrics';
import StreakBadge from './progress/StreakBadge';
import MilestoneCelebrationOverlay from './progress/MilestoneCelebrationOverlay';
import WeeklySummaryCard from './progress/WeeklySummaryCard';

interface ProgressViewProps {
  bubbles: Bubble[];
  logs: Record<string, Log>;
  onOpenSnapshotModal: () => void;
  onOpenArchive: () => void;
}

export default function ProgressView({
  bubbles,
  logs,
  onOpenSnapshotModal,
  onOpenArchive,
}: ProgressViewProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [milestoneStoreTick, setMilestoneStoreTick] = useState(0);

  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const changeMonth = (dir: number) => {
    let { y, m } = viewMonth;
    m += dir;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    setViewMonth({ y, m });
  };

  const daysInViewMonth = new Date(viewMonth.y, viewMonth.m + 1, 0).getDate();

  const getStatusForBubbleOnDate = (bubble: Bubble, dateStr: string) => {
    const entry = logs[logKey(bubble.id, dateStr)];
    if (entry?.yn === 'yes') return 'done';
    if (entry?.yn === 'no') return 'missed';
    return 'unlogged';
  };

  const globalStreak = useMemo(() => getCurrentGlobalStreak(bubbles, logs), [bubbles, logs]);
  const streakRunStart = useMemo(() => getStreakRunStartDateStr(globalStreak), [globalStreak]);
  const milestoneToCelebrate = useMemo(
    () => getNextMilestoneToCelebrate(globalStreak, streakRunStart),
    [globalStreak, streakRunStart, milestoneStoreTick]
  );
  const successRate30 = useMemo(
    () => getSuccessRateLast30Days(bubbles, logs),
    [bubbles, logs]
  );

  const weeklySummary = useMemo(() => {
    if (new Date().getDay() !== 0) return null;
    return getWeekSummary(bubbles, logs, new Date());
  }, [bubbles, logs]);

  const habitMetrics = useMemo(() => {
    const today = new Date(todayStr() + 'T12:00:00');
    const isCurrentViewMonth = today.getFullYear() === viewMonth.y && today.getMonth() === viewMonth.m;
    const daysToCount = isCurrentViewMonth ? Math.min(today.getDate(), daysInViewMonth) : daysInViewMonth;
    const habitBubbles = bubbles;

    const getCurrentStreakForBubble = (bubble: Bubble) => {
      let streak = 0;
      const cursor = new Date(today);
      for (;;) {
        const dateStr = cursor.toISOString().slice(0, 10);
        if (getStatusForBubbleOnDate(bubble, dateStr) === 'done') {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
        break;
      }
      return streak;
    };

    return habitBubbles.map((bubble) => {
      let done = 0;
      let missed = 0;
      let unlogged = 0;
      for (let d = 1; d <= daysToCount; d++) {
        const dateStr = mkDate(viewMonth.y, viewMonth.m, d);
        const status = getStatusForBubbleOnDate(bubble, dateStr);
        if (status === 'done') done += 1;
        else if (status === 'missed') missed += 1;
        else unlogged += 1;
      }

      const loggedDays = done + missed;
      const consistency = loggedDays > 0 ? Math.round((done / loggedDays) * 100) : 0;

      return {
        bubble,
        daysToCount,
        done,
        missed,
        unlogged,
        consistency,
        currentStreak: getCurrentStreakForBubble(bubble),
      };
    });
  }, [bubbles, daysInViewMonth, logs, viewMonth]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {milestoneToCelebrate && streakRunStart ? (
        <MilestoneCelebrationOverlay
          milestone={milestoneToCelebrate}
          onDismiss={() => {
            recordStreakMilestoneCelebration(streakRunStart, milestoneToCelebrate);
            setMilestoneStoreTick((t) => t + 1);
          }}
        />
      ) : null}
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12">
        <div className="max-w-[860px] mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
                Progress
              </div>
              <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
                Every bubble is a habit—monthly summary across neutral, positive, and needs work.
              </div>
            </div>
            <button
              onClick={onOpenSnapshotModal}
              className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap hover:opacity-90"
              style={{
                fontFamily: 'var(--font-b)',
                background: 'var(--gold)',
                color: '#fff',
              }}
            >
              + Snapshot
            </button>
          </div>

          <div className="flex flex-wrap items-stretch gap-4 mb-6">
            <StreakBadge days={globalStreak} />
            <div
              className="flex-1 min-w-[200px] rounded-[10px] border px-4 py-3 flex flex-col justify-center"
              style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
              title="Share of the last 30 days where you marked at least one habit done"
            >
              <span className="text-[0.58rem] tracking-[0.1em] uppercase" style={{ color: 'var(--ink4)' }}>
                Success rate
              </span>
              <span
                className="text-[1.35rem] font-semibold tabular-nums mt-1"
                style={{ fontFamily: 'var(--font-b)', color: 'var(--ink)' }}
              >
                {successRate30 != null ? `${successRate30}%` : '—'}
              </span>
              <span className="text-[0.65rem] mt-0.5" style={{ color: 'var(--ink3)' }}>
                Last 30 days
              </span>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[0.62rem] tracking-[0.08em] uppercase mr-1" style={{ color: 'var(--ink4)' }}>
              Month
            </span>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="w-[26px] h-[26px] rounded-full bg-transparent border cursor-pointer text-[0.8rem] flex items-center justify-center transition-all duration-150 hover:opacity-80"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink3)' }}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span
              style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
              className="text-[0.9rem] italic min-w-[116px] text-center"
            >
              {MONTHS[viewMonth.m]} {viewMonth.y}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="w-[26px] h-[26px] rounded-full bg-transparent border cursor-pointer text-[0.8rem] flex items-center justify-center transition-all duration-150 hover:opacity-80"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink3)' }}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {weeklySummary ? <WeeklySummaryCard stats={weeklySummary} /> : null}

          <div className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--ink3)' }}>
            Monthly habit counts
          </div>

          {habitMetrics.length === 0 ? (
            <div className="rounded-[10px] border p-4 mb-5" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
              <div className="text-[0.72rem]" style={{ color: 'var(--ink3)' }}>
                No items yet. Add habits in Map to see monthly counts here.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 mb-5">
              {habitMetrics.map(({ bubble, daysToCount, done, missed, unlogged, consistency, currentStreak }) => {
                const completedPct =
                  daysToCount > 0 ? Math.min(100, Math.round((done / daysToCount) * 100)) : 0;
                return (
                <div
                  key={bubble.id}
                  className="rounded-[10px] border p-3"
                  style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-[0.83rem] font-medium" style={{ color: 'var(--ink)' }}>
                      {bubble.label}
                    </div>
                    <div className="text-[0.7rem]" style={{ color: 'var(--ink3)' }}>
                      Streak: <strong style={{ color: 'var(--ink)' }}>{currentStreak}</strong>
                    </div>
                  </div>

                  <div
                    className="mt-2.5 flex items-center gap-2.5"
                    title={`Completed ${done} of ${daysToCount} days in this month`}
                  >
                    <div
                      className="flex-1 min-w-0 h-[7px] rounded-full overflow-hidden border"
                      style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)' }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={Math.max(daysToCount, 1)}
                      aria-valuenow={done}
                      aria-label={`Completed ${done} of ${daysToCount} days this month`}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-300 ease-out"
                        style={{
                          width: `${completedPct}%`,
                          background: 'linear-gradient(90deg, rgba(202,166,67,0.95), rgba(202,166,67,0.75))',
                        }}
                      />
                    </div>
                    <span
                      className="text-[0.62rem] tabular-nums flex-shrink-0 font-medium"
                      style={{ color: 'var(--ink3)', fontFamily: 'var(--font-b)' }}
                    >
                      {completedPct}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 flex-wrap text-[0.68rem]" style={{ color: 'var(--ink3)' }}>
                    <span>
                      Completed: <strong style={{ color: 'var(--ink)' }}>{done}</strong>/{daysToCount}
                    </span>
                    <span>
                      Not done: <strong style={{ color: 'var(--red)' }}>{missed}</strong>
                    </span>
                    <span>
                      Unlogged: <strong style={{ color: 'var(--ink4)' }}>{unlogged}</strong>
                    </span>
                    <span>
                      Consistency: <strong style={{ color: 'var(--ink)' }}>{consistency}%</strong>
                    </span>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          <div
            className="rounded-[10px] border p-4 mb-4"
            style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
          >
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="text-[0.72rem]" style={{ color: 'var(--ink2)' }}>
                Snapshots & restore
              </div>
              <button
                onClick={onOpenArchive}
                className="text-[0.68rem] underline underline-offset-2 hover:opacity-80"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
              >
                Open Archive →
              </button>
            </div>
            <div className="text-[0.62rem]" style={{ color: 'var(--ink4)' }}>
              Snapshot history and management live in the Archive tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
