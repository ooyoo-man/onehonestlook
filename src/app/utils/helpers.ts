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
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

export const getDayKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

// ISO week key, e.g. 2026-W12 (UTC calendar date — aligns with snapshot ISO timestamps)
export const getWeekKey = (d: Date) => {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

// Bi-week key from ISO week number, e.g. 2026-BW06
export const getBiWeekKey = (d: Date) => {
  const weekKey = getWeekKey(d); // YYYY-Wxx
  const [year, isoWeekPart] = weekKey.split('-W');
  const weekNo = Number(isoWeekPart);
  const biWeekNo = Math.ceil(weekNo / 2);
  return `${year}-BW${String(biWeekNo).padStart(2, '0')}`;
};

export const getArchivePeriodKey = (
  d: Date,
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly'
) => {
  if (cadence === 'daily') return getDayKey(d);
  if (cadence === 'weekly') return getWeekKey(d);
  if (cadence === 'biweekly') return getBiWeekKey(d);
  return getMonthKey(d);
};

export const getYearFromDateIso = (isoDate: string) => new Date(isoDate).getUTCFullYear();
