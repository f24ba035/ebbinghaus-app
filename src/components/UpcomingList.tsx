import React from 'react';
import { Calendar, CalendarDays } from 'lucide-react';
import type { StudyItem } from '../types';
import { formatJapaneseDate, getTodayString, getRelativeDateLabel } from '../utils/date';

interface UpcomingListProps {
  items: StudyItem[];
}

export const UpcomingList: React.FC<UpcomingListProps> = ({ items }) => {
  const todayStr = getTodayString();

  // 明日以降（nextDueDate > todayStr）で active なものを日付順にソート
  const upcomingItems = items
    .filter((item) => item.status === 'active' && item.nextDueDate > todayStr)
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));

  if (upcomingItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">
          今後の予定はありません
        </h3>
        <p className="text-xs text-slate-500">
          新しく勉強した内容を登録すると、翌日以降の復習スケジュールが自動作成されます。
        </p>
      </div>
    );
  }

  // 日付ごとにグループ化
  const groupedByDate: { [date: string]: StudyItem[] } = {};
  upcomingItems.forEach((item) => {
    if (!groupedByDate[item.nextDueDate]) {
      groupedByDate[item.nextDueDate] = [];
    }
    groupedByDate[item.nextDueDate].push(item);
  });

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          明日以降の復習スケジュール（合計{upcomingItems.length}件）
        </h2>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedByDate).map(([dateStr, dateItems]) => {
          const relativeLabel = getRelativeDateLabel(dateStr, todayStr);
          const formattedDate = formatJapaneseDate(dateStr);

          return (
            <div
              key={dateStr}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {formattedDate}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {relativeLabel}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {dateItems.length}件
                </span>
              </div>

              <div className="space-y-2 pt-0.5">
                {dateItems.map((item) => {
                  const isStep1 = item.currentStep === 1;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-1"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {item.title}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isStep1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isStep1 ? '1回目' : '2回目'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
