import React, { useRef } from 'react';
import { X, Download, Upload, Trash2, Database, Sparkles } from 'lucide-react';
import type { StudyItem } from '../types';
import { saveItems, getMockItems } from '../utils/storage';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StudyItem[];
  onReload: (items: StudyItem[]) => void;
}

export const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose, items, onReload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // JSONエクスポート
  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ebbinghaus_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // JSONインポート
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveItems(parsed);
          onReload(parsed);
          alert('データをインポートしました！');
          onClose();
        } else {
          alert('JSONファイルの形式が正しくありません。');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  // サンプル（モック）データの再読み込み
  const handleLoadMockData = () => {
    const mocks = getMockItems();
    saveItems(mocks);
    onReload(mocks);
    onClose();
  };

  // 全データ初期化
  const handleReset = () => {
    if (confirm('すべての学習記録を削除して初期化しますか？（後からいつでもサンプルデータを読み込むことも可能です）')) {
      saveItems([]);
      onReload([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">データ管理・バックアップ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          学習記録はお使いのスマホ・ブラウザ内に安全に保存されています。機種変更時やバックアップ用にファイルを保存・復元できます。
        </p>

        <div className="space-y-2">
          {/* サンプル（モック）データの復元ボタン */}
          <button
            onClick={handleLoadMockData}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-blue-200 transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            サンプル（モック）データを復元
          </button>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-slate-600" />
            データを出力（JSON保存）
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            データを復元（JSON読み込み）
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 text-xs font-bold py-2 px-4 rounded-xl transition-all pt-3 border-t border-slate-100"
          >
            <Trash2 className="w-4 h-4" />
            全記録を初期化する
          </button>
        </div>
      </div>
    </div>
  );
};
