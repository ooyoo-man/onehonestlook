export const todayStr = () => new Date().toISOString().slice(0, 10);

export const logKey = (id: number, date: string) => `${id}_${date}`;

export const fmtDate = (d: Date) => 
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const mkDate = (y: number, m: number, d: number) => 
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const escapeHtml = (s: string) => 
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const getMonthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

// ISO week key, e.g. 2026-W12
export const getWeekKey = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const getArchivePeriodKey = (d: Date, cadence: 'weekly' | 'monthly') =>
  cadence === 'weekly' ? getWeekKey(d) : getMonthKey(d);

export const getYearFromDateIso = (isoDate: string) => new Date(isoDate).getFullYear();
