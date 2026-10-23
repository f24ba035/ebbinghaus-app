import React, { useRef } from 'react';
import { X, Download, Upload, Trash2, Database } from 'lucide-react';
import type { StudyItem, KanjiItem } from '../types';
import { saveItems, saveKanjiItems } from '../utils/storage';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StudyItem[];
  kanjiItems?: KanjiItem[];
  onReload: (items: StudyItem[], kanjiItems?: KanjiItem[]) => void;
}

export const DataModal: React.FC<DataModalProps> = ({
  isOpen,
  onClose,
  items,
  kanjiItems = [],
  onReload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // JSONエクスポート
  const handleExport = () => {
    const backupData = {
      version: 2,
      studyItems: items,
      kanjiItems: kanjiItems,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(backupData, null, 2);
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
          // 旧形式（配列そのまま）
          saveItems(parsed);
          onReload(parsed, kanjiItems);
          alert('通常学習データをインポートしました！');
          onClose();
        } else if (parsed && typeof parsed === 'object') {
          // 新形式（studyItems, kanjiItems を含むオブジェクト）
          const loadedStudy = Array.isArray(parsed.studyItems) ? parsed.studyItems : [];
          const loadedKanji = Array.isArray(parsed.kanjiItems) ? parsed.kanjiItems : [];
          saveItems(loadedStudy);
          saveKanjiItems(loadedKanji);
          onReload(loadedStudy, loadedKanji);
          alert('すべての学習データと漢字データをインポートしました！');
          onClose();
        } else {
          alert('JSONファイルの形式が正しくありません。');
        }
      } catch {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  // 全データ初期化
  const handleReset = () => {
    if (confirm('すべての通常学習記録および漢字記録を削除して初期化しますか？この操作は取り消せません。')) {
      saveItems([]);
      saveKanjiItems([]);
      onReload([], []);
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
