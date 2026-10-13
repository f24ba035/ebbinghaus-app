import React from 'react';
import { X, Smartphone, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">使い方 & スマホ追加</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* スマホChromeでのアプリ化手順 */}
        <div className="bg-blue-50/80 rounded-2xl p-3.5 border border-blue-100/80 space-y-2">
          <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">1</span>
            スマホのホーム画面に追加する方法
          </h4>
          <ol className="text-xs text-blue-800 space-y-1.5 pl-1 leading-relaxed">
            <li>
              <strong>Android (Chrome):</strong> 右上のメニュー（︙）をタップし、「<strong>ホーム画面に追加</strong>」または「<strong>アプリをインストール</strong>」を選択。
            </li>
            <li>
              <strong>iPhone (Safari):</strong> 画面下の共有ボタン（四角から矢印）をタップし、「<strong>ホーム画面に追加</strong>」を選択。
            </li>
          </ol>
          <p className="text-[11px] text-blue-600 font-medium">
            ※ アドレスバーが消え、通常のアプリと同じ感覚で全画面起動できます。
          </p>
        </div>

        {/* 復習サイクルの仕組み */}
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            エビングハウス動的スケジュールの仕組み
          </h4>
          <ul className="space-y-2 pl-2">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>登録日:</strong> 学んだ内容を登録すると、自動で「翌日（1日後）」に1回目の復習がセットされます。</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-purple-500 font-bold">•</span>
              <span><strong>予定通りにいかなくても安心:</strong> 1日後にできず2日後に遅れても、責められることなく「今日やるべき復習」にまとまります。</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>動的リスケジュール:</strong> 1回目の復習を完了した日を起点にして、そこから「6日後」に2回目の復習が自動で設定されます。</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-800 active:scale-98 transition-all"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
