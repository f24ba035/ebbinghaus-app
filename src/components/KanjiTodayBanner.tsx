import React from 'react';
import { PenTool, ArrowRight } from 'lucide-react';

interface KanjiTodayBannerProps {
  dueCount: number;
  onStartTest: () => void;
}

export const KanjiTodayBanner: React.FC<KanjiTodayBannerProps> = ({ dueCount, onStartTest }) => {
  if (dueCount === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight bg-indigo-100 text-indigo-800 border border-indigo-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              漢字の復習
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            漢字テスト（{dueCount}問）
          </h3>
        </div>
      </div>

      {/* 今日の復習リストと統一されたボタンスタイル */}
      <button
        onClick={onStartTest}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <PenTool className="w-4 h-4 stroke-[2.5]" />
        <span>復習を開始する（{dueCount}問）</span>
        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
      </button>
    </div>
  );
};
