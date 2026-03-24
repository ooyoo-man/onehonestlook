export interface Bubble {
  id: number;
  label: string;
  cat: 'neutral' | 'positive' | 'negative' | 'habit';
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