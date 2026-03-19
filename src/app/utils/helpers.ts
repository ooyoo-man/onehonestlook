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
