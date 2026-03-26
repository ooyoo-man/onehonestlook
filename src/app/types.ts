export interface Bubble {
  id: number;
  label: string;
  /** Every bubble is a habit; this is the kind of habit. */
  cat: 'neutral' | 'positive' | 'negative';
  priorityLane?: 'now' | 'next' | 'later';
  focusOrder?: number;
  x: number;
  y: number;
  reflections?: Record<string, string>;
  importance?: number; // 1-10 ranking
}

export interface Snapshot {
  id: number;
  name: string;
  note: string;
  date: string;
  bubbles: Bubble[];
  source?: 'manual' | 'auto';
  cadence?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  periodKey?: string;
}

export interface Log {
  yn: 'yes' | 'no' | null;
  note: string;
}

/** Private same-day check-in: why the day felt hard + self-forgiveness (stored locally by date). */
export interface DayReflection {
  whyMediocre: string;
  selfForgiveness: string;
  updatedAt: string;
}

export interface ArchiveSettings {
  autoArchiveEnabled: boolean;
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

export interface IntakeAnswers {
  identityStrengths: string[];
  growthAreas: string[];
  habitsToBuild: string[];
  habitsToReduce: string[];
  focusDomains: string[];
  customEntries: string;
}

export interface FocusSprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  goalNote?: string;
}

export interface Resource {
  id: number;
  name: string;
  type: 'book' | 'article' | 'practice' | 'tool';
  desc: string;
  tags: string[];
}