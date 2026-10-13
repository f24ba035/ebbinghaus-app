import React from 'react';
import { Award, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import type { StudyItem } from '../types';
import { formatJapaneseDate } from '../utils/date';

interface CompletedListProps {
  items: StudyItem[];
  onRestart: (item: StudyItem) => void;
  onDelete: (id: string) => void;
}

export const CompletedList: React.FC<CompletedListProps> = ({ items, onRestart, onDelete }) => {
  const completedItems = items.filter((item) => item.status === 'completed');

  if (completedItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">
          定着済みの項目はまだありません
        </h3>
        <p className="text-xs text-slate-500">
          2回の復習（1日後・6日後）を完了すると、長期記憶としてここに記録されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          定着済みマスター学習（{completedItems.length}件）
        </h2>
      </div>

      <div className="space-y-2.5">
        {completedItems.map((item) => {
          const step1Log = item.history.find((h) => h.step === 1);
          const step2Log = item.history.find((h) => h.step === 2);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      記憶定着完了
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatJapaneseDate(item.createdAt)} 開始
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 line-through decoration-slate-300">
                    {item.title}
                  </h3>
                </div>

                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="削除"
                  aria-label="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 復習履歴ログ */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-500 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[11px]">
                    ・1回目復習: {step1Log ? formatJapaneseDate(step1Log.completedAt) : '完了'}
                  </p>
                  <p className="text-[11px]">
                    ・2回目復習: {step2Log ? formatJapaneseDate(step2Log.completedAt) : '完了'}
                  </p>
                </div>

                <button
                  onClick={() => onRestart(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-50 transition-all shrink-0"
                  title="再度1回目の復習からやり直す"
                >
                  <RotateCcw className="w-3 h-3" />
                  もう一度学習
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
