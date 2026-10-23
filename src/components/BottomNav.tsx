import React from 'react';
import { BookOpen, PenTool } from 'lucide-react';

export type MainNavMode = 'study' | 'kanji';

interface BottomNavProps {
  currentMode: MainNavMode;
  onSelectMode: (mode: MainNavMode) => void;
  studyDueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentMode,
  onSelectMode,
  studyDueCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-2 px-3 py-1.5 gap-2">
        {/* 通常学習タブ */}
        <button
          onClick={() => onSelectMode('study')}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all relative ${
            currentMode === 'study'
              ? 'text-blue-600 bg-blue-50/80 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5 mb-0.5" />
            {studyDueCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white">
                {studyDueCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">学習記録</span>
        </button>

        {/* 漢字学習タブ（通知バッジなし） */}
        <button
          onClick={() => onSelectMode('kanji')}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all relative ${
            currentMode === 'kanji'
              ? 'text-indigo-600 bg-indigo-50/80 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <PenTool className="w-5 h-5 mb-0.5" />
          </div>
          <span className="text-[11px] tracking-tight">漢字学習</span>
        </button>
      </div>
    </nav>
  );
};
