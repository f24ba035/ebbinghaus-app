import React from 'react';
import { CheckCircle2, Clock, CalendarDays } from 'lucide-react';

export type TabType = 'today' | 'upcoming' | 'completed';

interface TabNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  todayCount: number;
}

export const TabNav: React.FC<TabNavProps> = ({ currentTab, onSelectTab, todayCount }) => {
  return (
    <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl">
      <button
        onClick={() => onSelectTab('today')}
        className={`relative flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
          currentTab === 'today'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>今日の復習</span>
        {todayCount > 0 && (
          <span
            className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
              currentTab === 'today'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-blue-600 text-white'
            }`}
          >
            {todayCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('upcoming')}
        className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
          currentTab === 'upcoming'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span>今後の予定</span>
      </button>

      <button
        onClick={() => onSelectTab('completed')}
        className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
          currentTab === 'completed'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>定着済み</span>
      </button>
    </div>
  );
};
