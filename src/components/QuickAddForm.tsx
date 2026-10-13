import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface QuickAddFormProps {
  onAdd: (title: string) => void;
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle('');
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 transition-all">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            新しく学習した内容を記録
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            翌日に1回目の復習を自動設定
          </span>
        </label>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 英単語 1〜50p, 統計学 第2章"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>登録</span>
          </button>
        </div>
      </form>
    </div>
  );
};
