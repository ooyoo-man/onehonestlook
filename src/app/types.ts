export interface Bubble {
  id: number;
  label: string;
  cat: 'neutral' | 'positive' | 'negative' | 'habit';
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
  cadence?: 'weekly' | 'monthly';
  periodKey?: string;
}

export interface Log {
  yn: 'yes' | 'no' | null;
  note: string;
}

export interface ArchiveSettings {
  autoArchiveEnabled: boolean;
  cadence: 'weekly' | 'monthly';
}

export interface Resource {
  id: number;
  name: string;
  type: 'book' | 'article' | 'practice' | 'tool';
  desc: string;
  tags: string[];
}