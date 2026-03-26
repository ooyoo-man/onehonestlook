import { useMemo, useState } from 'react';
import { Bubble, IntakeAnswers } from '../../types';

interface IntakeQuestionnaireModalProps {
  isOpen: boolean;
  onComplete: (answers: IntakeAnswers) => void;
  onSkip: () => void;
}

const DEFAULT_ANSWERS: IntakeAnswers = {
  identityStrengths: [],
  growthAreas: [],
  habitsToBuild: [],
  habitsToReduce: [],
  focusDomains: [],
  customEntries: '',
};

const STRENGTH_OPTIONS = ['Calm under pressure', 'Empathetic', 'Reliable', 'Curious', 'Disciplined'];
const GROWTH_OPTIONS = ['Procrastination', 'Overthinking', 'Avoiding hard conversations', 'Low consistency', 'Poor boundaries'];
const BUILD_HABIT_OPTIONS = ['Exercise', 'Sleep routine', 'Planning', 'Reading', 'Meditation'];
const REDUCE_HABIT_OPTIONS = ['Scrolling', 'Late-night snacking', 'Alcohol', 'Gaming overload', 'Negative self-talk'];
const DOMAIN_OPTIONS = ['Health', 'Relationships', 'Career', 'Mindset', 'Finances'];

function toggleItem(list: string[], item: string) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function chipStyle(active: boolean) {
  return {
    fontFamily: 'var(--font-b)',
    background: active ? 'var(--bg)' : 'var(--bg2)',
    borderColor: active ? 'rgba(30,28,24,0.24)' : 'var(--rule)',
    color: active ? 'var(--ink)' : 'var(--ink3)',
  };
}

export function buildStarterBubblesFromIntake(answers: IntakeAnswers): Omit<Bubble, 'x' | 'y'>[] {
  const entries: Array<{ label: string; cat: Bubble['cat'] }> = [];

  answers.identityStrengths.forEach((s) => entries.push({ label: s, cat: 'positive' }));
  answers.growthAreas.forEach((s) => entries.push({ label: s, cat: 'negative' }));
  answers.habitsToBuild.forEach((s) => entries.push({ label: s, cat: 'positive' }));
  answers.habitsToReduce.forEach((s) => entries.push({ label: `Reduce: ${s}`, cat: 'negative' }));
  answers.focusDomains.forEach((s) => entries.push({ label: `${s} focus`, cat: 'neutral' }));

  answers.customEntries
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((s) => entries.push({ label: s, cat: 'neutral' }));

  // Deduplicate labels while preserving order.
  const seen = new Set<string>();
  const deduped = entries.filter((e) => {
    const key = e.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.map((item, i) => ({
    id: Date.now() + Math.random() + i / 1000,
    label: item.label.slice(0, 40),
    cat: item.cat,
  }));
}

export default function IntakeQuestionnaireModal({ isOpen, onComplete, onSkip }: IntakeQuestionnaireModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(DEFAULT_ANSWERS);
  const totalSteps = 6;

  const canContinue = useMemo(() => {
    if (step === 0) return answers.identityStrengths.length > 0;
    if (step === 1) return answers.growthAreas.length > 0;
    if (step === 2) return answers.habitsToBuild.length > 0;
    if (step === 3) return answers.habitsToReduce.length > 0;
    if (step === 4) return answers.focusDomains.length > 0;
    return true;
  }, [answers, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[1000]" style={{ background: 'rgba(28,26,22,0.44)' }}>
      <div
        className="w-full max-w-[680px] rounded-[14px] border p-6"
        style={{ background: 'var(--bg)', borderColor: 'var(--rule)', boxShadow: 'var(--sh-lg)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.1rem] italic">
              Intake Questionnaire
            </div>
            <div className="text-[0.72rem]" style={{ color: 'var(--ink3)' }}>
              Let&apos;s build a starting map you can refine later.
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-[0.68rem] bg-transparent border-none cursor-pointer hover:opacity-80"
            style={{ color: 'var(--ink4)' }}
          >
            Skip for now
          </button>
        </div>

        <div className="mb-5 text-[0.66rem]" style={{ color: 'var(--ink4)' }}>
          Step {step + 1} of {totalSteps}
        </div>

        {step === 0 && (
          <QuestionSection
            title="What strengths describe who you are today?"
            options={STRENGTH_OPTIONS}
            selected={answers.identityStrengths}
            onToggle={(item) => setAnswers((a) => ({ ...a, identityStrengths: toggleItem(a.identityStrengths, item) }))}
          />
        )}
        {step === 1 && (
          <QuestionSection
            title="Where do you most want growth?"
            options={GROWTH_OPTIONS}
            selected={answers.growthAreas}
            onToggle={(item) => setAnswers((a) => ({ ...a, growthAreas: toggleItem(a.growthAreas, item) }))}
          />
        )}
        {step === 2 && (
          <QuestionSection
            title="Which habits do you want to build?"
            options={BUILD_HABIT_OPTIONS}
            selected={answers.habitsToBuild}
            onToggle={(item) => setAnswers((a) => ({ ...a, habitsToBuild: toggleItem(a.habitsToBuild, item) }))}
          />
        )}
        {step === 3 && (
          <QuestionSection
            title="Which habits do you want to reduce?"
            options={REDUCE_HABIT_OPTIONS}
            selected={answers.habitsToReduce}
            onToggle={(item) => setAnswers((a) => ({ ...a, habitsToReduce: toggleItem(a.habitsToReduce, item) }))}
          />
        )}
        {step === 4 && (
          <QuestionSection
            title="What life domains matter most right now?"
            options={DOMAIN_OPTIONS}
            selected={answers.focusDomains}
            onToggle={(item) => setAnswers((a) => ({ ...a, focusDomains: toggleItem(a.focusDomains, item) }))}
          />
        )}
        {step === 5 && (
          <div>
            <div className="text-[0.82rem] font-medium mb-2" style={{ color: 'var(--ink)' }}>
              Any custom items to include?
            </div>
            <p className="text-[0.7rem] mb-2" style={{ color: 'var(--ink3)' }}>
              One per line. We&apos;ll add these as neutral items you can categorize later.
            </p>
            <textarea
              value={answers.customEntries}
              onChange={(e) => setAnswers((a) => ({ ...a, customEntries: e.target.value }))}
              className="w-full min-h-[110px] rounded-lg border px-3 py-2 text-[0.78rem] outline-none"
              style={{ borderColor: 'var(--rule)', background: 'var(--bg2)', color: 'var(--ink)' }}
              placeholder={'e.g.\nBe more present with family\nStop avoiding feedback'}
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-[0.71rem] px-3 py-1.5 rounded-md border transition-all duration-150 disabled:opacity-40"
            style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink2)' }}
          >
            Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
              disabled={!canContinue}
              className="text-[0.71rem] px-3 py-1.5 rounded-md border-none transition-all duration-150 disabled:opacity-40"
              style={{ background: 'var(--gold)', color: '#fff', fontFamily: 'var(--font-b)' }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => onComplete(answers)}
              className="text-[0.71rem] px-3 py-1.5 rounded-md border-none transition-all duration-150"
              style={{ background: 'var(--gold)', color: '#fff', fontFamily: 'var(--font-b)' }}
            >
              Create My Starter Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <div className="text-[0.82rem] font-medium mb-3" style={{ color: 'var(--ink)' }}>
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className="text-[0.69rem] px-3 py-1.5 rounded-full border transition-all duration-150"
              style={chipStyle(active)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

