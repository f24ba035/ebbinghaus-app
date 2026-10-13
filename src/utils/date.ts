// ローカルタイムゾーン基準の YYYY-MM-DD 文字列を取得
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

// 指定した YYYY-MM-DD 文字列に n 日加算した YYYY-MM-DD を返す
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// ユーザー向けの日本語表示フォーマット (例: 10月14日(水))
export function formatJapaneseDate(dateStr: string, includeYear: boolean = false): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayName = dayNames[date.getDay()];
  
  if (includeYear) {
    return `${year}年${month}月${day}日(${dayName})`;
  }
  return `${month}月${day}日(${dayName})`;
}

// 今日との日付差を計算 (負なら過去、正なら未来、0なら今日)
export function getDiffDaysFromToday(dateStr: string, todayStr: string = getTodayString()): number {
  const [y1, m1, d1] = dateStr.split('-').map(Number);
  const [y2, m2, d2] = todayStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1).getTime();
  const date2 = new Date(y2, m2 - 1, d2).getTime();
  const diffTime = date1 - date2;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// 人間にわかりやすい相対表記 (例: 明日、3日後)
export function getRelativeDateLabel(dateStr: string, todayStr: string = getTodayString()): string {
  const diff = getDiffDaysFromToday(dateStr, todayStr);
  if (diff === 0) return '今日';
  if (diff === 1) return '明日';
  if (diff === 2) return '明後日';
  if (diff > 0) return `${diff}日後`;
  return `${Math.abs(diff)}日前`;
}
