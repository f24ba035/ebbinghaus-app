import React from 'react';
import { Calendar, HelpCircle, Smartphone } from 'lucide-react';
import { formatJapaneseDate, getTodayString } from '../utils/date';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenDataModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp, onOpenDataModal }) => {
  const todayStr = getTodayString();
  const formattedToday = formatJapaneseDate(todayStr, true);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            忘却曲線 復習トラッカー
          </h1>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedToday}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            title="使い方・スマホ追加方法"
            aria-label="使い方・スマホ追加方法"
          >
            <Smartphone className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={onOpenDataModal}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            title="データ設定・バックアップ"
            aria-label="データ設定"
          >
            <HelpCircle className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
