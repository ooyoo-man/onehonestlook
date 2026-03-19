import { useState, useEffect } from 'react';
import { Bubble, Log } from '../../types';
import { logKey } from '../../utils/helpers';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteContext: { bubbleId: number; dateStr: string } | null;
  bubbles: Bubble[];
  logs: Record<string, Log>;
  setLogs: (logs: Record<string, Log>) => void;
}

export default function NoteModal({ isOpen, onClose, noteContext, bubbles, logs, setLogs }: NoteModalProps) {
  const [selectedYN, setSelectedYN] = useState<'yes' | 'no' | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (isOpen && noteContext) {
      const key = logKey(noteContext.bubbleId, noteContext.dateStr);
      const existingLog = logs[key];
      setSelectedYN(existingLog?.yn || null);
      setNoteText(existingLog?.note || '');
    }
  }, [isOpen, noteContext, logs]);

  if (!isOpen || !noteContext) return null;

  const bubble = bubbles.find(b => b.id === noteContext.bubbleId);
  const date = new Date(noteContext.dateStr + 'T12:00:00');

  const handleSave = () => {
    if (!selectedYN && !noteText.trim()) {
      onClose();
      return;
    }

    const key = logKey(noteContext.bubbleId, noteContext.dateStr);
    const newLogs = {
      ...logs,
      [key]: {
        yn: selectedYN,
        note: noteText.trim(),
      },
    };
    setLogs(newLogs);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center p-4 z-[1000] animate-[fadeIn_0.14s_ease]"
      style={{ background: 'rgba(28,26,22,0.4)' }}
    >
      <div
        className="rounded-[13px] p-6 w-full max-w-[460px] border animate-[slideUp_0.17s_cubic-bezier(0.25,0,0,1)]"
        style={{ background: 'var(--bg)', borderColor: 'var(--rule)', boxShadow: 'var(--sh-lg)' }}
      >
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.05rem] italic mb-1">
          {bubble ? bubble.label : 'Daily note'}
        </div>
        <div className="text-[0.7rem] leading-relaxed mb-4" style={{ color: 'var(--ink3)' }}>
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <div className="mb-3">
          <label className="text-[0.65rem] font-medium tracking-[0.08em] uppercase block mb-1" style={{ color: 'var(--ink3)' }}>
            Did you make progress today?
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedYN('yes')}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium text-[0.78rem] cursor-pointer transition-all duration-150 ${
                selectedYN === 'yes' ? '' : ''
              }`}
              style={{
                fontFamily: 'var(--font-b)',
                background: selectedYN === 'yes' ? 'var(--green-bg)' : 'var(--bg2)',
                borderColor: selectedYN === 'yes' ? 'var(--green-ln)' : 'var(--rule)',
                color: selectedYN === 'yes' ? 'var(--green)' : 'var(--ink3)',
              }}
            >
              ✓ &nbsp;Yes
            </button>
            <button
              onClick={() => setSelectedYN('no')}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium text-[0.78rem] cursor-pointer transition-all duration-150 ${
                selectedYN === 'no' ? '' : ''
              }`}
              style={{
                fontFamily: 'var(--font-b)',
                background: selectedYN === 'no' ? 'var(--red-bg)' : 'var(--bg2)',
                borderColor: selectedYN === 'no' ? 'var(--red-ln)' : 'var(--rule)',
                color: selectedYN === 'no' ? 'var(--red)' : 'var(--ink3)',
              }}
            >
              ✕ &nbsp;No
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[0.65rem] font-medium tracking-[0.08em] uppercase block mb-1" style={{ color: 'var(--ink3)' }}>
            Note <span className="font-light normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="What happened? How did it go?"
            className="w-full text-[0.78rem] rounded-lg px-3 py-1.5 border outline-none transition-all duration-150 resize-vertical min-h-[62px] leading-relaxed"
            style={{
              fontFamily: 'var(--font-b)',
              background: 'var(--bg2)',
              borderColor: 'var(--rule)',
              color: 'var(--ink)',
            }}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border transition-all duration-150 tracking-wide hover:opacity-80"
            style={{
              fontFamily: 'var(--font-b)',
              borderColor: 'var(--rule)',
              background: 'var(--bg)',
              color: 'var(--ink2)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide hover:opacity-90"
            style={{
              fontFamily: 'var(--font-b)',
              background: 'var(--gold)',
              color: '#fff',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
