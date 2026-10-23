import React, { useState } from 'react';
import { Eye, Check, X, ArrowRight, Award } from 'lucide-react';
import type { KanjiItem } from '../types';

interface KanjiTestViewProps {
  items: KanjiItem[];
  onReviewResult: (item: KanjiItem, remembered: boolean) => void;
  onFinish: () => void;
}

export const KanjiTestView: React.FC<KanjiTestViewProps> = ({ items, onReviewResult, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [results, setResults] = useState<{ id: string; remembered: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/90 shadow-sm space-y-4">
        <p className="text-slate-600 font-medium">現在復習対象の漢字はありません。</p>
        <button
          onClick={onFinish}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all"
        >
          戻る
        </button>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const progressPercent = Math.round(((currentIndex) / items.length) * 100);

  // 回答判定（覚えている / 忘れた）
  const handleAnswer = (remembered: boolean) => {
    onReviewResult(currentItem, remembered);
    const newResults = [...results, { id: currentItem.id, remembered }];
    setResults(newResults);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex(currentIndex + 1);
      setIsAnswerShown(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const successCount = results.filter((r) => r.remembered).length;
    const failCount = results.length - successCount;

    return (
      <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-xs space-y-5">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800">本日のテスト完了</h2>
          <p className="text-xs text-slate-500">お疲れ様でした。復習結果が記録されました。</p>
        </div>

        {/* 成績サマリー */}
        <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
            <div className="text-xl font-bold text-slate-800">{successCount}</div>
            <div className="text-[11px] font-medium text-slate-500">覚えている</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
            <div className="text-xl font-bold text-slate-800">{failCount}</div>
            <div className="text-[11px] font-medium text-slate-500">復習が必要</div>
          </div>
        </div>

        {failCount > 0 && (
          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            「復習が必要」とした漢字は、明日また出題されます。
          </p>
        )}

        <button
          onClick={onFinish}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>戻る</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 上部バー：進捗と終了ボタン */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            問題 {currentIndex + 1} / {items.length}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            漢字テスト
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm('テストを中断して戻りますか？（回答済みの漢字は保存されています）')) {
              onFinish();
            }
          }}
          className="text-xs text-slate-400 hover:text-slate-600 font-medium"
        >
          中断する
        </button>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* フラッシュカード本体 */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center space-y-6">
        {/* 出題（よみがな） */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            よみがな（問題）
          </span>
          <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-wider">
            {currentItem.reading}
          </div>
        </div>

        {/* 答えの表示領域 */}
        {isAnswerShown ? (
          <div className="w-full pt-4 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              正解の漢字
            </span>
            <div className="text-4xl md:text-5xl font-black text-blue-900 tracking-widest py-2">
              {currentItem.kanji}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAnswerShown(true)}
            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Eye className="w-5 h-5 text-slate-500" />
            答えを見る
          </button>
        )}

        {/* 判定ボタン群 */}
        {isAnswerShown && (
          <div className="w-full grid grid-cols-2 gap-3 pt-2 animate-in fade-in duration-150">
            <button
              onClick={() => handleAnswer(false)}
              className="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] border border-rose-200 text-rose-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs"
            >
              <X className="w-5 h-5 text-rose-600" />
              忘れた（明日再復習）
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <Check className="w-5 h-5" />
              覚えている！
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
