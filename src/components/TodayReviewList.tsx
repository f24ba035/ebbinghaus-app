import React, { useState } from 'react';
import { Check, CheckCircle2, MoreVertical, Trash2, Edit3, BookOpen } from 'lucide-react';
import type { StudyItem } from '../types';
import { formatJapaneseDate } from '../utils/date';
import { KanjiTodayBanner } from './KanjiTodayBanner';

interface TodayReviewListProps {
  items: StudyItem[];
  onComplete: (item: StudyItem) => void;
  onDelete: (id: string) => void;
  onEditTitle: (id: string, newTitle: string) => void;
  onEditItem?: (id: string, updates: { title?: string; nextDueDate?: string }) => void;
  kanjiDueCount?: number;
  onStartKanjiTest?: () => void;
}

export const TodayReviewList: React.FC<TodayReviewListProps> = ({
  items,
  onComplete,
  onDelete,
  onEditTitle,
  onEditItem,
  kanjiDueCount = 0,
  onStartKanjiTest
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const startEdit = (item: StudyItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDueDate(item.nextDueDate);
    setMenuOpenId(null);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      if (onEditItem) {
        onEditItem(id, {
          title: editTitle.trim(),
          nextDueDate: editDueDate || undefined
        });
      } else {
        onEditTitle(id, editTitle.trim());
      }
    }
    setEditingId(null);
  };

  const totalDueCount = items.length + (kanjiDueCount > 0 ? 1 : 0);

  if (items.length === 0 && kanjiDueCount === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          今日の復習はありません
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          今日予定されている復習はありません。新しく学んだことがあれば、上の入力欄から記録しましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          今日やるべき復習（{totalDueCount}件）
        </h2>
        <span className="text-[11px] text-slate-400">
          手元で復習後、完了をタップ
        </span>
      </div>

      <div className="space-y-2.5">
        {/* 漢字復習カード（他の通常復習カードと全く同じ並びに1つの項目として配置） */}
        {kanjiDueCount > 0 && onStartKanjiTest && (
          <KanjiTodayBanner dueCount={kanjiDueCount} onStartTest={onStartKanjiTest} />
        )}

        {items.map((item) => {
          const isStep1 = item.currentStep === 1;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* ステップバッジ（何回目の復習かが一目でわかる） */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight ${
                        isStep1
                          ? 'bg-blue-100 text-blue-800 border border-blue-200/60'
                          : 'bg-purple-100 text-purple-800 border border-purple-200/60'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {isStep1 ? '1回目の復習' : '2回目の復習'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {isStep1
                        ? `学習開始: ${formatJapaneseDate(item.createdAt)}`
                        : `1回目完了: ${formatJapaneseDate(item.history[0]?.completedAt || item.createdAt)}`}
                    </span>
                  </div>

                  {/* 学習タイトル */}
                  {editingId === item.id ? (
                    <div className="space-y-2 mt-1 p-3 bg-slate-50 rounded-xl border border-blue-200">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          学習タイトル
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="text-[11px] font-bold">復習予定日:</span>
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-700 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-base font-bold text-slate-900 leading-snug break-words">
                      {item.title}
                    </h3>
                  )}
                </div>

                {/* 操作メニュー */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="メニュー"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpenId === item.id && (
                    <div className="absolute right-0 top-8 bg-white border border-slate-200 shadow-lg rounded-xl py-1 z-10 w-28 text-xs font-medium">
                      <button
                        onClick={() => startEdit(item)}
                        className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        編集
                      </button>
                      <button
                        onClick={() => {
                          onDelete(item.id);
                          setMenuOpenId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 完了ボタン（押しやすい大型アクションボタン） */}
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  {isStep1 ? (
                    <>完了後、次は <strong className="text-slate-600 font-semibold">6日後</strong> にセット</>
                  ) : (
                    <>完了すると <strong className="text-emerald-600 font-semibold">記憶定着達成</strong></>
                  )}
                </span>

                <button
                  onClick={() => onComplete(item)}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all ${
                    isStep1
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>復習完了を記録</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
