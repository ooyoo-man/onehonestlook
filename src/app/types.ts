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
}

export interface Log {
  yn: 'yes' | 'no' | null;
  note: string;
}

export interface Resource {
  id: number;
  name: string;
  type: 'book' | 'article' | 'practice' | 'tool';
  desc: string;
  tags: string[];
}