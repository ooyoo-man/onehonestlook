import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { MilestoneDay } from '../../utils/streakMetrics';

const MILESTONE_COPY: Record<
  MilestoneDay,
  { title: string; body: string }
> = {
  7: {
    title: 'One week strong',
    body: 'Seven days in a row showing up for yourself. That consistency adds up.',
  },
  30: {
    title: '30-day milestone',
    body: 'A full month of momentum. You have proven you can stick with it.',
  },
  60: {
    title: '60 days — serious dedication',
    body: 'Two months of streak. Habits are becoming part of who you are.',
  },
  100: {
    title: '100-day achievement',
    body: 'Triple digits. Few people stay this honest with themselves for this long.',
  },
};

function fireFullScreenConfetti(): () => void {
  let cancelled = false;
  const duration = 2800;
  const end = Date.now() + duration;
  const colors = ['#CAA643', '#e8d48a', '#8b6b2a', '#f5eee0', '#5c4a2a'];

  const frame = () => {
    if (cancelled) return;
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 10000,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 10000,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.55 },
    colors,
    zIndex: 10000,
    scalar: 1.1,
  });
  const t = window.setTimeout(() => {
    if (cancelled) return;
    confetti({
      particleCount: 80,
      spread: 160,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.3 },
      colors,
      zIndex: 10000,
    });
  }, 200);

  return () => {
    cancelled = true;
    window.clearTimeout(t);
  };
}

interface MilestoneCelebrationOverlayProps {
  milestone: MilestoneDay;
  onDismiss: () => void;
}

export default function MilestoneCelebrationOverlay({
  milestone,
  onDismiss,
}: MilestoneCelebrationOverlayProps) {
  const copy = MILESTONE_COPY[milestone];

  useEffect(() => fireFullScreenConfetti(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: 'rgba(30,28,24,0.55)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-celebration-title"
      onClick={onDismiss}
    >
      <div
        className="max-w-[400px] w-full rounded-[14px] border p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderColor: 'rgba(202,166,67,0.55)',
          boxShadow: '0 22px 60px rgba(30,28,24,0.2)',
        }}
      >
        <div
          className="text-[0.65rem] tracking-[0.14em] uppercase mb-2"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
        >
          {milestone}-day streak
        </div>
        <h2
          id="milestone-celebration-title"
          className="text-[1.35rem] italic mb-3"
          style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
        >
          {copy.title}
        </h2>
        <p className="text-[0.78rem] leading-relaxed mb-6" style={{ color: 'var(--ink3)' }}>
          {copy.body}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[0.74rem] font-medium px-5 py-2.5 rounded-md border-none w-full sm:w-auto transition-opacity hover:opacity-92"
          style={{
            fontFamily: 'var(--font-b)',
            background: 'var(--gold)',
            color: '#fff',
          }}
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="block w-full mt-3 text-[0.68rem] underline-offset-2 hover:opacity-80 bg-transparent border-0 cursor-pointer"
          style={{ color: 'var(--ink4)' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
