import { useState } from 'react';
import { Bubble, Snapshot, Log } from '../types';
import { todayStr, logKey, mkDate, fmtDate } from '../utils/helpers';
import TrackerBlock from './TrackerBlock';
import SnapshotCard from './SnapshotCard';

interface ProgressViewProps {
  bubbles: Bubble[];
  snapshots: Snapshot[];
  setSnapshots: (snapshots: Snapshot[]) => void;
  logs: Record<string, Log>;
  setBubbles: (bubbles: Bubble[]) => void;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
  onOpenSnapshotModal: () => void;
}

export default function ProgressView({
  bubbles,
  snapshots,
  setSnapshots,
  logs,
  setBubbles,
  onOpenNoteModal,
  onOpenSnapshotModal,
}: ProgressViewProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });

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
          {bubbles.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--ink3)' }}>
              <span
                style={{ fontFamily: 'var(--font-h)', color: 'var(--ink4)' }}
                className="text-[1.6rem] italic block mb-3"
              >
                —
              </span>
              <p className="text-[0.76rem] leading-[1.9]">
                Add bubbles to your map first,
                <br />
                then track your daily progress here.
              </p>
            </div>
          ) : (
            bubbles.map(bubble => (
              <TrackerBlock
                key={bubble.id}
                bubble={bubble}
                viewMonth={viewMonth}
                logs={logs}
                onOpenNoteModal={onOpenNoteModal}
              />
            ))
          )}

          {/* Snapshots */}
          <div className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-4 mt-10" style={{ color: 'var(--ink3)' }}>
            Map Snapshots
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--ink3)' }}>
              <span
                style={{ fontFamily: 'var(--font-h)', color: 'var(--ink4)' }}
                className="text-[1.6rem] italic block mb-3"
              >
                —
              </span>
              <p className="text-[0.76rem] leading-[1.9]">
                No snapshots yet.
                <br />
                Hit <strong>Snapshot</strong> in the header to freeze your map.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-3">
              {snapshots.map(snapshot => (
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
