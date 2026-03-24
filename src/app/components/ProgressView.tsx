import { useMemo, useState } from 'react';
import { Bubble, Snapshot, Log } from '../types';
import { getYearFromDateIso, todayStr, logKey, mkDate, fmtDate } from '../utils/helpers';
import TrackerBlock from './TrackerBlock';
import SnapshotCard from './SnapshotCard';
import ProgressSummaryCards from './progress/ProgressSummaryCards';
import ProgressTrendLine from './progress/ProgressTrendLine';
import ProgressFilters, { ProgressStatusFilter } from './progress/ProgressFilters';

interface ProgressViewProps {
  bubbles: Bubble[];
  snapshots: Snapshot[];
  setSnapshots: (snapshots: Snapshot[]) => void;
  logs: Record<string, Log>;
  setBubbles: (bubbles: Bubble[]) => void;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
  onBulkSetYN: (bubbleId: number, dateStrs: string[], yn: 'yes' | 'no' | null) => void;
  onOpenSnapshotModal: () => void;
  onOpenArchive: () => void;
}

export default function ProgressView({
  bubbles,
  snapshots,
  setSnapshots,
  logs,
  setBubbles,
  onOpenNoteModal,
  onBulkSetYN,
  onOpenSnapshotModal,
  onOpenArchive,
}: ProgressViewProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [activeYear, setActiveYear] = useState<number | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | Bubble['cat']>('all');
  const [activeStatus, setActiveStatus] = useState<ProgressStatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'lane'>('category');
  const [sortBy, setSortBy] = useState<'name' | 'consistency-desc' | 'consistency-asc'>('consistency-desc');

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
  const monthLabel = `${MONTHS[viewMonth.m]} ${viewMonth.y}`;

  const categoryFilteredBubbles = useMemo(() => {
    if (activeCategory === 'all') return bubbles;
    return bubbles.filter(b => b.cat === activeCategory);
  }, [activeCategory, bubbles]);

  const getStatusForBubbleOnDate = (bubble: Bubble, dateStr: string) => {
    const entry = logs[logKey(bubble.id, dateStr)];
    if (entry?.yn === 'yes') return 'done';
    if (entry?.yn === 'no') return 'missed';
    return 'unlogged';
  };

  const statusFilteredBubbles = useMemo(() => {
    if (activeStatus === 'all') return categoryFilteredBubbles;
    return categoryFilteredBubbles.filter(b => getStatusForBubbleOnDate(b, selectedDate) === activeStatus);
  }, [activeStatus, categoryFilteredBubbles, selectedDate, logs]);

  const getMonthConsistency = (bubble: Bubble) => {
    let yes = 0;
    let logged = 0;
    for (let d = 1; d <= daysInViewMonth; d++) {
      const ds = mkDate(viewMonth.y, viewMonth.m, d);
      const status = getStatusForBubbleOnDate(bubble, ds);
      if (status === 'done') {
        yes++;
        logged++;
      } else if (status === 'missed') {
        logged++;
      }
    }
    return logged > 0 ? yes / logged : 0;
  };

  const organizedBubbles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = statusFilteredBubbles.filter((b) => (q ? b.label.toLowerCase().includes(q) : true));

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.label.localeCompare(b.label);
      const diff = getMonthConsistency(b) - getMonthConsistency(a);
      return sortBy === 'consistency-desc' ? diff : -diff;
    });
    return list;
  }, [statusFilteredBubbles, searchQuery, sortBy, viewMonth, logs]);

  const groupedBubbles = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: 'All items', items: organizedBubbles }];
    }
    if (groupBy === 'category') {
      const order: Bubble['cat'][] = ['positive', 'negative', 'habit', 'neutral'];
      const titles: Record<Bubble['cat'], string> = {
        positive: 'Positive',
        negative: 'Needs work',
        habit: 'Habits',
        neutral: 'Neutral',
      };
      return order
        .map((cat) => ({
          key: cat,
          title: titles[cat],
          items: organizedBubbles.filter((b) => b.cat === cat),
        }))
        .filter((g) => g.items.length > 0);
    }
    const order: Array<'now' | 'next' | 'later'> = ['now', 'next', 'later'];
    const titles: Record<'now' | 'next' | 'later', string> = {
      now: 'Now',
      next: 'Next',
      later: 'Later',
    };
    return order
      .map((lane) => ({
        key: lane,
        title: `${titles[lane]} focus`,
        items: organizedBubbles.filter((b) => (b.priorityLane ?? 'later') === lane),
      }))
      .filter((g) => g.items.length > 0);
  }, [organizedBubbles, groupBy]);

  const trendPoints = useMemo(() => {
    const todayISO = todayStr();
    return Array.from({ length: daysInViewMonth }, (_, idx) => {
      const day = idx + 1;
      const date = mkDate(viewMonth.y, viewMonth.m, day);
      const isFuture = date > todayISO;

      let done = 0;
      let considered = 0;
      for (const bubble of categoryFilteredBubbles) {
        const status = getStatusForBubbleOnDate(bubble, date);
        if (status === 'done') {
          done++;
          considered++;
        } else if (status === 'missed') {
          considered++;
        }
      }

      return {
        date,
        day,
        ratio: considered > 0 ? done / considered : null,
        isFuture,
        isSelected: date === selectedDate,
      };
    });
  }, [daysInViewMonth, viewMonth, categoryFilteredBubbles, logs, selectedDate]);

  const getRollingCompletionRate = (windowDays: number) => {
    const end = new Date(todayStr() + 'T12:00:00');
    let done = 0;
    let considered = 0;

    for (let i = 0; i < windowDays; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      for (const bubble of categoryFilteredBubbles) {
        const status = getStatusForBubbleOnDate(bubble, dateStr);
        if (status === 'done') {
          done++;
          considered++;
        } else if (status === 'missed') {
          considered++;
        }
      }
    }

    return considered > 0 ? Math.round((done / considered) * 100) : 0;
  };

  const getStreaks = () => {
    const today = new Date(todayStr() + 'T12:00:00');
    const start = new Date(today);
    start.setDate(today.getDate() - 365);

    const dailyAnyDone: Array<{ date: string; done: boolean }> = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const done = categoryFilteredBubbles.some(b => getStatusForBubbleOnDate(b, dateStr) === 'done');
      dailyAnyDone.push({ date: dateStr, done });
      cursor.setDate(cursor.getDate() + 1);
    }

    let longest = 0;
    let running = 0;
    for (const d of dailyAnyDone) {
      if (d.done) {
        running += 1;
        if (running > longest) longest = running;
      } else {
        running = 0;
      }
    }

    let current = 0;
    for (let i = dailyAnyDone.length - 1; i >= 0; i--) {
      if (dailyAnyDone[i].done) current += 1;
      else break;
    }

    return { current, longest };
  };

  const rate7 = getRollingCompletionRate(7);
  const rate30 = getRollingCompletionRate(30);
  const rate90 = getRollingCompletionRate(90);
  const streaks = getStreaks();

  const deleteSnapshot = (id: number) => {
    if (window.confirm('Delete this snapshot?')) {
      setSnapshots(snapshots.filter(s => s.id !== id));
    }
  };

  const restoreSnapshot = (id: number) => {
    const snap = snapshots.find(s => s.id === id);
    if (!snap || !window.confirm(`Restore "${snap.name}"? Your current map will be replaced.`)) return;
    setBubbles(JSON.parse(JSON.stringify(snap.bubbles)));
  };

  const snapshotYears = useMemo(() => {
    const years = Array.from(new Set(snapshots.map(s => getYearFromDateIso(s.date))));
    return years.sort((a, b) => b - a);
  }, [snapshots]);

  const filteredSnapshots = useMemo(() => {
    if (activeYear === 'all') return snapshots;
    return snapshots.filter(s => getYearFromDateIso(s.date) === activeYear);
  }, [activeYear, snapshots]);

  const manualCount = filteredSnapshots.filter(s => (s.source ?? 'manual') === 'manual').length;
  const autoCount = filteredSnapshots.filter(s => (s.source ?? 'manual') === 'auto').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12">
        <div className="max-w-[860px] mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
                Progress
              </div>
              <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
                Daily tracking across every bubble, plus map snapshots.
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

          {/* Daily Tracker */}
          <div className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-4" style={{ color: 'var(--ink3)' }}>
            Daily Tracker
          </div>

          <ProgressSummaryCards
            rate7={rate7}
            rate30={rate30}
            rate90={rate90}
            currentStreak={streaks.current}
            longestStreak={streaks.longest}
          />

          <ProgressTrendLine
            monthLabel={monthLabel}
            points={trendPoints}
            onSelectDate={(date) => setSelectedDate(date)}
          />

          <ProgressFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
          />

          {/* Organization tools */}
          <div className="rounded-[10px] border p-3 mb-5" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[0.62rem] tracking-[0.08em] uppercase mr-1" style={{ color: 'var(--ink4)' }}>
                Organize
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="text-[0.68rem] px-2.5 py-1 rounded-md border outline-none min-w-[170px]"
                style={{ borderColor: 'var(--rule)', background: 'var(--bg2)', color: 'var(--ink2)' }}
              />
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'none' | 'category' | 'lane')}
                className="text-[0.66rem] px-2 py-1 rounded-md border outline-none"
                style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink2)' }}
              >
                <option value="none">Group: None</option>
                <option value="category">Group: Category</option>
                <option value="lane">Group: Focus lane</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'consistency-desc' | 'consistency-asc')}
                className="text-[0.66rem] px-2 py-1 rounded-md border outline-none"
                style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink2)' }}
              >
                <option value="consistency-desc">Sort: Consistency (high → low)</option>
                <option value="consistency-asc">Sort: Consistency (low → high)</option>
                <option value="name">Sort: Name</option>
              </select>
              <span className="text-[0.66rem] ml-auto" style={{ color: 'var(--ink4)' }}>
                Showing {organizedBubbles.length} item{organizedBubbles.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => changeMonth(-1)}
              className="w-[26px] h-[26px] rounded-full bg-transparent border cursor-pointer text-[0.8rem] flex items-center justify-center transition-all duration-150 hover:opacity-80"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink3)' }}
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
              onClick={() => changeMonth(1)}
              className="w-[26px] h-[26px] rounded-full bg-transparent border cursor-pointer text-[0.8rem] flex items-center justify-center transition-all duration-150 hover:opacity-80"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink3)' }}
            >
              ›
            </button>
          </div>

          {/* Tracker blocks */}
          {organizedBubbles.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--ink3)' }}>
              <span
                style={{ fontFamily: 'var(--font-h)', color: 'var(--ink4)' }}
                className="text-[1.6rem] italic block mb-3"
              >
                —
              </span>
              <p className="text-[0.76rem] leading-[1.9]">
                {bubbles.length === 0 ? (
                  <>
                    Add bubbles to your map first,
                    <br />
                    then track your daily progress here.
                  </>
                ) : (
                  <>
                    No items match this filter or search.
                    <br />
                    Try another category or status.
                  </>
                )}
              </p>
            </div>
          ) : (
            groupedBubbles.map((group) => (
              <div key={group.key}>
                {groupBy !== 'none' && (
                  <div
                    className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-3"
                    style={{ color: 'var(--ink3)' }}
                  >
                    {group.title} ({group.items.length})
                  </div>
                )}
                {group.items.map((bubble) => (
                  <TrackerBlock
                    key={bubble.id}
                    bubble={bubble}
                    viewMonth={viewMonth}
                    logs={logs}
                    onOpenNoteModal={onOpenNoteModal}
                    highlightedDate={selectedDate}
                    onBulkSetYN={onBulkSetYN}
                  />
                ))}
              </div>
            ))
          )}

          {/* Snapshots */}
          <div className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-4 mt-10" style={{ color: 'var(--ink3)' }}>
            Map Snapshots
          </div>

          <div className="rounded-[10px] border p-4 mb-4" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="text-[0.72rem]" style={{ color: 'var(--ink2)' }}>
                Archive Summary
              </div>
              <button
                onClick={onOpenArchive}
                className="text-[0.68rem] underline underline-offset-2 hover:opacity-80"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
              >
                Open full Archive →
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <button
                onClick={() => setActiveYear('all')}
                className="text-[0.66rem] px-2.5 py-1 rounded-full border transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: activeYear === 'all' ? 'var(--bg2)' : 'transparent',
                  borderColor: 'var(--rule)',
                  color: activeYear === 'all' ? 'var(--ink)' : 'var(--ink3)',
                }}
              >
                All years
              </button>
              {snapshotYears.map(y => (
                <button
                  key={y}
                  onClick={() => setActiveYear(y)}
                  className="text-[0.66rem] px-2.5 py-1 rounded-full border transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: activeYear === y ? 'var(--bg2)' : 'transparent',
                    borderColor: 'var(--rule)',
                    color: activeYear === y ? 'var(--ink)' : 'var(--ink3)',
                  }}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-[0.68rem]" style={{ color: 'var(--ink3)' }}>
              <span>Total: <strong style={{ color: 'var(--ink)' }}>{filteredSnapshots.length}</strong></span>
              <span>Manual: <strong style={{ color: 'var(--ink)' }}>{manualCount}</strong></span>
              <span>Auto: <strong style={{ color: 'var(--ink)' }}>{autoCount}</strong></span>
            </div>
          </div>

          {filteredSnapshots.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--ink3)' }}>
              <span
                style={{ fontFamily: 'var(--font-h)', color: 'var(--ink4)' }}
                className="text-[1.6rem] italic block mb-3"
              >
                —
              </span>
              <p className="text-[0.76rem] leading-[1.9]">
                No snapshots in this range yet.
                <br />
                Hit <strong>Snapshot</strong> in the header to freeze your map.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-3">
              {filteredSnapshots.map(snapshot => (
                <SnapshotCard
                  key={snapshot.id}
                  snapshot={snapshot}
                  onDelete={deleteSnapshot}
                  onRestore={restoreSnapshot}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
