import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Bubble } from '../../types';

interface ExploreBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bubble: Bubble | null;
  onSaveReflection: (bubbleId: number, reflections: Record<string, string>) => void;
  existingReflections?: Record<string, string>;
}

const EXPLORATION_QUESTIONS = {
  positive: [
    {
      id: 'why-matters',
      question: 'Why does this matter to you?',
      prompt: 'What makes this quality or activity meaningful in your life?'
    },
    {
      id: 'when-strong',
      question: 'When do you feel strongest in this area?',
      prompt: 'Describe a recent moment when you embodied this.'
    },
    {
      id: 'growth',
      question: 'How could you grow this further?',
      prompt: 'What would the next level look like?'
    },
    {
      id: 'obstacles',
      question: 'What gets in the way of this?',
      prompt: 'What barriers or challenges do you face?'
    }
  ],
  negative: [
    {
      id: 'impact',
      question: 'How does this affect your life?',
      prompt: 'What impact does this have on you and those around you?'
    },
    {
      id: 'triggers',
      question: 'What triggers this behavior?',
      prompt: 'When or why does this tend to happen?'
    },
    {
      id: 'underneath',
      question: 'What need is this trying to meet?',
      prompt: 'What might you really be seeking when you do this?'
    },
    {
      id: 'alternative',
      question: 'What could you do instead?',
      prompt: 'What healthier alternatives might serve you better?'
    }
  ],
  neutral: [
    {
      id: 'role',
      question: 'What role does this play in your life?',
      prompt: 'How does this fit into your daily routine or identity?'
    },
    {
      id: 'direction',
      question: 'Where do you want this to go?',
      prompt: 'Should this stay neutral, or move in a particular direction?'
    },
    {
      id: 'awareness',
      question: 'What are you noticing about this?',
      prompt: 'What patterns or insights have you observed?'
    },
    {
      id: 'intention',
      question: 'What intention do you bring to this?',
      prompt: 'How do you want to approach this moving forward?'
    }
  ]
};

export default function ExploreBubbleModal({
  isOpen,
  onClose,
  bubble,
  onSaveReflection,
  existingReflections = {}
}: ExploreBubbleModalProps) {
  const [reflections, setReflections] = useState<Record<string, string>>(existingReflections);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bubble) {
      setReflections(existingReflections);
      setExpandedQuestion(null);
    }
  }, [isOpen, bubble, existingReflections]);

  if (!isOpen || !bubble) return null;

  const questions = EXPLORATION_QUESTIONS[bubble.cat] || EXPLORATION_QUESTIONS.neutral;

  const handleSave = () => {
    if (bubble) {
      onSaveReflection(bubble.id, reflections);
      onClose();
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'positive': return 'var(--blue-md)';
      case 'negative': return 'var(--red-md)';
      default: return 'var(--ink3)';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'positive': return 'Positive habit';
      case 'negative': return 'Needs work habit';
      case 'neutral': return 'Neutral habit';
      default: return 'Reflection';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[680px] max-h-[85vh] rounded-[13px] border flex flex-col overflow-hidden"
        style={{ background: 'var(--bg)', borderColor: 'var(--rule)', boxShadow: 'var(--sh-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--rule)' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2
                  style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
                  className="text-[1.5rem] italic"
                >
                  {bubble.label}
                </h2>
                <span
                  className="text-[0.62rem] font-medium tracking-[0.08em] uppercase px-2 py-1 rounded"
                  style={{ 
                    color: getCategoryColor(bubble.cat),
                    background: `${getCategoryColor(bubble.cat)}15`
                  }}
                >
                  {getCategoryLabel(bubble.cat)}
                </span>
              </div>
              <p className="text-[0.78rem]" style={{ color: 'var(--ink3)' }}>
                Take a moment to explore why this matters to you.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--rule2)] transition-colors"
              style={{ color: 'var(--ink3)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isExpanded = expandedQuestion === q.id;
              const hasContent = reflections[q.id]?.trim().length > 0;
              
              return (
                <div
                  key={q.id}
                  className="rounded-[10px] border transition-all duration-200"
                  style={{
                    borderColor: isExpanded ? 'var(--gold-lt)' : 'var(--rule)',
                    background: isExpanded ? 'var(--bg2)' : 'transparent'
                  }}
                >
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-[var(--rule2)] transition-colors rounded-[10px]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[0.68rem] font-medium tracking-[0.08em] uppercase"
                          style={{ color: 'var(--ink4)' }}
                        >
                          Question {idx + 1}
                        </span>
                        {hasContent && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--gold)' }}
                          />
                        )}
                      </div>
                      <p
                        className="text-[0.9rem] mb-1"
                        style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
                      >
                        {q.question}
                      </p>
                      <p className="text-[0.72rem]" style={{ color: 'var(--ink3)' }}>
                        {q.prompt}
                      </p>
                    </div>
                    <div
                      className="text-[1.2rem] transition-transform duration-200"
                      style={{ 
                        color: 'var(--ink3)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      ▼
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <textarea
                        value={reflections[q.id] || ''}
                        onChange={(e) => setReflections({ ...reflections, [q.id]: e.target.value })}
                        placeholder="Take your time... there's no rush to have all the answers."
                        className="w-full min-h-[140px] text-[0.82rem] leading-relaxed rounded-lg px-4 py-3 border outline-none resize-none transition-all duration-150 focus:border-[var(--gold-lt)]"
                        style={{
                          fontFamily: 'var(--font-b)',
                          background: 'var(--bg)',
                          borderColor: 'var(--rule)',
                          color: 'var(--ink)',
                        }}
                        autoFocus
                      />
                      <p className="text-[0.68rem] mt-2 italic" style={{ color: 'var(--ink4)' }}>
                        Your reflections are private and saved automatically.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--rule)' }}
        >
          <p className="text-[0.72rem] italic" style={{ color: 'var(--ink3)' }}>
            {Object.values(reflections).filter(r => r?.trim().length > 0).length} of {questions.length} questions answered
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-[0.82rem] font-medium px-5 py-2.5 rounded-lg border hover:bg-[var(--rule2)] transition-colors"
              style={{
                fontFamily: 'var(--font-b)',
                borderColor: 'var(--rule)',
                color: 'var(--ink2)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-[0.82rem] font-medium px-5 py-2.5 rounded-lg border-none transition-all duration-150 hover:opacity-90"
              style={{
                fontFamily: 'var(--font-b)',
                background: 'var(--gold)',
                color: '#fff',
              }}
            >
              Save Reflections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
