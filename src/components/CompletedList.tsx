import React, { useState } from 'react';
import { Award, Undo2, Trash2, CheckCircle2, Edit3 } from 'lucide-react';
import type { StudyItem } from '../types';
import { formatJapaneseDate } from '../utils/date';

interface CompletedListProps {
  items: StudyItem[];
  onRollback: (item: StudyItem) => void;
  onDelete: (id: string) => void;
  onEditTitle: (id: string, newTitle: string) => void;
}

export const CompletedList: React.FC<CompletedListProps> = ({
  items,
  onRollback,
  onDelete,
  onEditTitle
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (item: StudyItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onEditTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

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
          const isEditing = editingId === item.id;

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

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 border border-blue-400 rounded-lg px-2.5 py-1 text-sm text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 px-1 py-1"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-base font-bold text-slate-800 line-through decoration-slate-300">
                      {item.title}
                    </h3>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="タイトルを編集"
                      aria-label="タイトルを編集"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="削除"
                      aria-label="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
                  onClick={() => onRollback(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-blue-100 active:scale-95 transition-all shrink-0"
                  title="2回目の復習（未完了）にロールバックする"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  未完了に戻す
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
