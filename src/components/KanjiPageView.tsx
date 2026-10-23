import React, { useState } from 'react';
import { Plus, Trash2, BookCheck, Sparkles, Undo2, Award, CalendarDays, CheckCircle2 } from 'lucide-react';
import type { KanjiItem } from '../types';
import { createKanjiItem, saveKanjiItems } from '../utils/storage';
import { formatJapaneseDate, getTodayString, getRelativeDateLabel } from '../utils/date';

interface KanjiPageViewProps {
  kanjiItems: KanjiItem[];
  onKanjiAdded: (newItems: KanjiItem[]) => void;
  onDeleteKanji: (id: string) => void;
  onRollbackCompletedKanji: (item: KanjiItem) => void;
  onRollbackStep1Kanji: (item: KanjiItem) => void;
}

interface DraftKanji {
  id: string;
  reading: string;
  kanji: string;
}

type KanjiSubTab = 'register' | 'upcoming' | 'completed';

export const KanjiPageView: React.FC<KanjiPageViewProps> = ({
  kanjiItems,
  onKanjiAdded,
  onDeleteKanji,
  onRollbackCompletedKanji,
  onRollbackStep1Kanji
}) => {
  const todayStr = getTodayString();

  // 登録中の一時リスト
  const [draftList, setDraftList] = useState<DraftKanji[]>([]);
  const [currentReading, setCurrentReading] = useState('');
  const [currentKanji, setCurrentKanji] = useState('');
  const [activeTab, setActiveTab] = useState<KanjiSubTab>('register');

  // 一時リストへの追加
  const handleAddToDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentReading.trim() || !currentKanji.trim()) return;

    setDraftList((prev) => [
      ...prev,
      {
        id: 'draft_' + Math.random().toString(36).substring(2, 7),
        reading: currentReading.trim(),
        kanji: currentKanji.trim()
      }
    ]);
    setCurrentReading('');
    setCurrentKanji('');
  };

  // ドラフトから削除
  const handleRemoveDraft = (id: string) => {
    setDraftList((prev) => prev.filter((d) => d.id !== id));
  };

  // まとめて登録して明日にセット
  const handleBulkRegister = () => {
    if (draftList.length === 0) return;

    const newKanjiItems = draftList.map((d) => createKanjiItem(d.reading, d.kanji));
    const updated = [...newKanjiItems, ...kanjiItems];
    saveKanjiItems(updated);
    onKanjiAdded(newKanjiItems);
    setDraftList([]);
  };

  // 今後の予定（明日以降かつactive）
  const upcomingKanjiItems = kanjiItems
    .filter((k) => k.status === 'active' && k.nextDueDate > todayStr)
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));

  // 定着済み（completed）
  const completedKanjiItems = kanjiItems.filter((k) => k.status === 'completed');

  // 日付ごとのグループ化（今後の予定用）
  const groupedByDate: { [date: string]: KanjiItem[] } = {};
  upcomingKanjiItems.forEach((item) => {
    if (!groupedByDate[item.nextDueDate]) {
      groupedByDate[item.nextDueDate] = [];
    }
    groupedByDate[item.nextDueDate].push(item);
  });

  return (
    <div className="space-y-4">
      {/* サブタブ切り替え（学習記録のタブ構造・スタイルと完全統一） */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'register'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ステップ登録</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>今後の予定</span>
          {upcomingKanjiItems.length > 0 && (
            <span className="text-[10px] text-slate-400 font-bold">
              ({upcomingKanjiItems.length})
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'completed'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>定着済み</span>
          {completedKanjiItems.length > 0 && (
            <span className="text-[10px] text-slate-400 font-bold">
              ({completedKanjiItems.length})
            </span>
          )}
        </button>
      </div>

      {/* タブ①：ステップ登録 */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookCheck className="w-4 h-4 text-blue-600" />
                今日の学習ステップ登録
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                教材の1ステップ分をまとめて追加できます。登録すると明日自動的に出題されます。
              </p>
            </div>

            <form onSubmit={handleAddToDraft} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    よみがな（送り仮名含む）
                  </label>
                  <input
                    type="text"
                    value={currentReading}
                    onChange={(e) => setCurrentReading(e.target.value)}
                    placeholder="例: はしる"
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    漢字（答え）
                  </label>
                  <input
                    type="text"
                    value={currentKanji}
                    onChange={(e) => setCurrentKanji(e.target.value)}
                    placeholder="例: 走る"
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!currentReading.trim() || !currentKanji.trim()}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                一時リストに追加
              </button>
            </form>

            {/* 一時リスト */}
            {draftList.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>登録待ち ({draftList.length} 件)</span>
                  <button
                    onClick={() => setDraftList([])}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    クリア
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {draftList.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <span className="font-bold text-slate-400 w-5">{index + 1}.</span>
                      <span className="font-medium text-slate-700 flex-1">{item.reading}</span>
                      <span className="font-bold text-blue-600 mx-2">→</span>
                      <span className="font-bold text-slate-900 flex-1">{item.kanji}</span>
                      <button
                        onClick={() => handleRemoveDraft(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleBulkRegister}
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {draftList.length} 件をまとめて登録（明日の復習にセット）
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ②：今後の予定（学習記録のUpcomingListと同じ構成・未完了に戻すボタン完備） */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
              明日以降の漢字復習（合計{upcomingKanjiItems.length}件）
            </h2>
          </div>

          {upcomingKanjiItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                今後の漢字予定はありません
              </h3>
              <p className="text-xs text-slate-500">
                新しい漢字をステップ登録すると、明日以降の復習予定が自動作成されます。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedByDate).map(([dateStr, dateItems]) => {
                const relativeLabel = getRelativeDateLabel(dateStr, todayStr);
                const formattedDate = formatJapaneseDate(dateStr);

                return (
                  <div
                    key={dateStr}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {formattedDate}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {relativeLabel}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {dateItems.length}件
                      </span>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      {dateItems.map((item) => {
                        const isStep1 = item.currentStep === 1;
                        const hasCompletedStep1 = item.history.some((h) => h.step === 1);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0"
                          >
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {item.kanji}
                              </span>
                              <span className="text-xs text-slate-500">
                                ({item.reading})
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* 学習記録と同じ「未完了に戻す」ボタン */}
                              {(hasCompletedStep1 || item.previousStepBeforeFail !== undefined) && (
                                <button
                                  onClick={() => onRollbackStep1Kanji(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2 py-0.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                                  title="直前の復習状態（今日の復習）にロールバックする"
                                >
                                  <Undo2 className="w-3 h-3" />
                                  未完了に戻す
                                </button>
                              )}

                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  isStep1
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {isStep1 ? '1回目の復習' : '2回目の復習'}
                              </span>

                              <button
                                onClick={() => onDeleteKanji(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                                title="削除"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* タブ③：定着済み（学習記録のCompletedListと同じ構成・未完了に戻すボタン完備） */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              定着済み漢字（{completedKanjiItems.length}件）
            </h2>
          </div>

          {completedKanjiItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                定着済みの漢字はまだありません
              </h3>
              <p className="text-xs text-slate-500">
                2回の復習（1日後・6日後）をクリアすると、長期記憶としてここに記録されます。
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {completedKanjiItems.map((item) => {
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
                            {formatJapaneseDate(item.createdAt)} 登録
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <span>{item.kanji}</span>
                          <span className="text-xs font-normal text-slate-500">（{item.reading}）</span>
                        </h3>
                      </div>

                      <button
                        onClick={() => onDeleteKanji(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 学習記録と統一された履歴ログ & 「未完了に戻す」ボタン */}
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
                        onClick={() => onRollbackCompletedKanji(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-blue-100 active:scale-95 transition-all shrink-0 cursor-pointer"
                        title="2回目の復習（今日の復習）にロールバックする"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        未完了に戻す
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
