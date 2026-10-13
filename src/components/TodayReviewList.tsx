import React, { useState } from 'react';
import { Check, CheckCircle2, MoreVertical, Trash2, Edit3, BookOpen } from 'lucide-react';
import type { StudyItem } from '../types';
import { formatJapaneseDate } from '../utils/date';

interface TodayReviewListProps {
  items: StudyItem[];
  onComplete: (item: StudyItem) => void;
  onDelete: (id: string) => void;
  onEditTitle: (id: string, newTitle: string) => void;
}

export const TodayReviewList: React.FC<TodayReviewListProps> = ({
  items,
  onComplete,
  onDelete,
  onEditTitle
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const startEdit = (item: StudyItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setMenuOpenId(null);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onEditTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          今日の復習はすべて完了！
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          今日予定されていた復習はありません。素晴らしいペースです！新しく学んだことがあれば上のフォームから登録しましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          今日やるべき復習（{items.length}件）
        </h2>
        <span className="text-[11px] text-slate-400">
          手元で復習後、完了をタップ
        </span>
      </div>

      <div className="space-y-2.5">
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
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 border border-blue-400 rounded-lg px-2 py-1 text-sm text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-500 px-1 py-1"
                      >
                        取消
                      </button>
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
