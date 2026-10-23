import React, { useState } from 'react';
import { Header } from './components/Header';
import { QuickAddForm } from './components/QuickAddForm';
import { TabNav } from './components/TabNav';
import type { TabType } from './components/TabNav';
import { TodayReviewList } from './components/TodayReviewList';
import { UpcomingList } from './components/UpcomingList';
import { CompletedList } from './components/CompletedList';
import { Toast } from './components/Toast';
import { HelpModal } from './components/HelpModal';
import { DataModal } from './components/DataModal';
import { BottomNav } from './components/BottomNav';
import type { MainNavMode } from './components/BottomNav';
import { KanjiPageView } from './components/KanjiPageView';
import { KanjiTestView } from './components/KanjiTestView';
import type { StudyItem, KanjiItem, ToastMessage } from './types';
import {
  loadItems,
  saveItems,
  createStudyItem,
  progressReviewStep,
  rollbackCompletedItem,
  rollbackStep2ToStep1,
  loadKanjiItems,
  saveKanjiItems,
  processKanjiReview,
  rollbackCompletedKanjiItem,
  rollbackToPreviousReviewKanji
} from './utils/storage';
import { getTodayString, formatJapaneseDate } from './utils/date';

export const App: React.FC = () => {
  // 通常学習ステート
  const [items, setItems] = useState<StudyItem[]>(() => loadItems());
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // 漢字学習ステート
  const [kanjiItems, setKanjiItems] = useState<KanjiItem[]>(() => loadKanjiItems());
  const [mainNavMode, setMainNavMode] = useState<MainNavMode>('study');
  const [isKanjiTesting, setIsKanjiTesting] = useState(false);
  const [activeTestItems, setActiveTestItems] = useState<KanjiItem[]>([]);

  // モーダル・トースト
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [lastStateForUndo, setLastStateForUndo] = useState<StudyItem[] | null>(null);

  const todayStr = getTodayString();

  // 通常学習：「今日やるべき復習」の抽出（期日が今日以前の未完了タスク）
  const todayReviewItems = items.filter(
    (item) => item.status === 'active' && item.nextDueDate <= todayStr
  );

  // 漢字学習：「今日やるべき復習」の抽出（期日が今日以前の未完了タスク）
  const todayDueKanjiItems = kanjiItems.filter(
    (item) => item.status === 'active' && item.nextDueDate <= todayStr
  );

  // トースト表示管理
  const showToast = (toastMsg: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = {
      ...toastMsg,
      id: 'toast_' + Math.random().toString(36).substring(2, 9)
    };
    setToast(newToast);
    setTimeout(() => {
      setToast((prev) => (prev?.id === newToast.id ? null : prev));
    }, 5000);
  };

  // 新規通常学習の登録
  const handleAddItem = (title: string) => {
    setLastStateForUndo([...items]);
    const newItem = createStudyItem(title);
    const updated = [newItem, ...items];
    setItems(updated);
    saveItems(updated);

    showToast({
      title: '学習を記録しました',
      message: `明日（${formatJapaneseDate(newItem.nextDueDate)}）に1回目の復習をセットしました`,
      type: 'info',
      undoAction: handleUndo
    });
  };

  // 通常学習：復習完了
  const handleCompleteReview = (targetItem: StudyItem) => {
    setLastStateForUndo([...items]);
    const { updatedItem, nextDateLabel } = progressReviewStep(targetItem);
    const updatedItems = items.map((it) => (it.id === targetItem.id ? updatedItem : it));
    setItems(updatedItems);
    saveItems(updatedItems);

    if (targetItem.currentStep === 1) {
      showToast({
        title: '1回目の復習を完了！',
        message: `次回（2回目）は ${formatJapaneseDate(nextDateLabel)}（6日後）にセットされました`,
        type: 'success',
        undoAction: handleUndo
      });
    } else {
      showToast({
        title: '全ステップ達成！🎉',
        message: `「${targetItem.title}」の記憶定着が完了しました`,
        type: 'success',
        undoAction: handleUndo
      });
    }
  };

  // 通常学習：完了の取り消し (Undo)
  const handleUndo = () => {
    if (lastStateForUndo) {
      setItems(lastStateForUndo);
      saveItems(lastStateForUndo);
      setLastStateForUndo(null);
      showToast({
        title: '元に戻しました',
        message: '直前の操作を取り消しました',
        type: 'info'
      });
    }
  };

  // 通常学習：削除
  const handleDeleteItem = (id: string) => {
    if (!confirm('この学習項目を削除しますか？')) {
      return;
    }
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveItems(updated);
    showToast({
      title: '削除しました',
      message: '学習項目を削除しました',
      type: 'info'
    });
  };

  // 通常学習：項目編集
  const handleEditItem = (id: string, updates: { title?: string; nextDueDate?: string }) => {
    const updated = items.map((it) => {
      if (it.id !== id) return it;
      return {
        ...it,
        title: updates.title !== undefined ? updates.title.trim() : it.title,
        nextDueDate: updates.nextDueDate !== undefined ? updates.nextDueDate : it.nextDueDate
      };
    });
    setItems(updated);
    saveItems(updated);
    showToast({
      title: '更新しました',
      message: '学習内容を保存しました',
      type: 'info'
    });
  };

  const handleEditTitle = (id: string, newTitle: string) => {
    handleEditItem(id, { title: newTitle });
  };

  // 定着済みから未完了へのロールバック
  const handleRollbackCompleted = (item: StudyItem) => {
    if (!confirm(`「${item.title}」を未完了に戻しますか？\n\n『今日やるべき復習（2回目）』に再度追加されます。`)) {
      return;
    }
    const rolledBack = rollbackCompletedItem(item);
    const updated = items.map((it) => (it.id === item.id ? rolledBack : it));
    setItems(updated);
    saveItems(updated);
    showToast({
      title: '未完了に戻しました',
      message: `「${item.title}」を2回目の復習待ち（今日やるべき復習）に戻しました`,
      type: 'info'
    });
  };

  // 2回目復習待ちから1回目復習待ちへのロールバック
  const handleRollbackStep1 = (item: StudyItem) => {
    if (!confirm(`「${item.title}」を未完了に戻しますか？\n\n『今日やるべき復習（1回目）』に再度追加されます。`)) {
      return;
    }
    const rolledBack = rollbackStep2ToStep1(item);
    const updated = items.map((it) => (it.id === item.id ? rolledBack : it));
    setItems(updated);
    saveItems(updated);
    showToast({
      title: '未完了に戻しました',
      message: `「${item.title}」を1回目の復習待ち（今日やるべき復習）に戻しました`,
      type: 'info'
    });
  };

  // -----------------------------------------------------------------
  // 漢字学習関連ハンドラー
  // -----------------------------------------------------------------
  // 漢字の新規追加（教材の1ステップ分）
  const handleKanjiAdded = (newItems: KanjiItem[]) => {
    const updated = [...newItems, ...kanjiItems];
    setKanjiItems(updated);
    showToast({
      title: '漢字を登録しました！',
      message: `${newItems.length}件の漢字を明日（1日後）の復習予定にセットしました`,
      type: 'info'
    });
  };

  // 漢字の個別削除
  const handleDeleteKanji = (id: string) => {
    if (!confirm('この漢字を削除しますか？')) return;
    const updated = kanjiItems.filter((k) => k.id !== id);
    setKanjiItems(updated);
    saveKanjiItems(updated);
    showToast({
      title: '削除しました',
      message: '漢字をリストから削除しました',
      type: 'info'
    });
  };

  // 漢字テストの1問回答処理
  const handleKanjiReviewResult = (item: KanjiItem, remembered: boolean) => {
    const { updatedItem } = processKanjiReview(item, remembered);
    const updatedList = kanjiItems.map((k) => (k.id === item.id ? updatedItem : k));
    setKanjiItems(updatedList);
    saveKanjiItems(updatedList);
  };

  // 漢字テストの開始（通常ページまたは漢字ページのバナーから）
  const handleStartKanjiTest = () => {
    if (todayDueKanjiItems.length === 0) return;
    setActiveTestItems([...todayDueKanjiItems]); // テスト開始時の出題リストを固定保持
    setMainNavMode('kanji');
    setIsKanjiTesting(true);
  };

  // 漢字：定着済みから未完了（2回目の復習待ち）へのロールバック
  const handleRollbackCompletedKanji = (item: KanjiItem) => {
    if (!confirm(`「${item.kanji}」を未完了に戻しますか？\n\n『今日の復習（2回目）』に再度追加されます。`)) {
      return;
    }
    const rolledBack = rollbackCompletedKanjiItem(item);
    const updated = kanjiItems.map((k) => (k.id === item.id ? rolledBack : k));
    setKanjiItems(updated);
    saveKanjiItems(updated);
    showToast({
      title: '未完了に戻しました',
      message: `「${item.kanji}」を2回目の復習待ちに戻しました`,
      type: 'info'
    });
  };

  // 漢字：2回目復習待ち、または「忘れた」で明日送りになった漢字を未完了に戻す
  const handleRollbackStep1Kanji = (item: KanjiItem) => {
    if (!confirm(`「${item.kanji}」を未完了に戻しますか？\n\n『今日の復習』に再度追加されます。`)) {
      return;
    }
    const rolledBack = rollbackToPreviousReviewKanji(item);
    const updated = kanjiItems.map((k) => (k.id === item.id ? rolledBack : k));
    setKanjiItems(updated);
    saveKanjiItems(updated);
    showToast({
      title: '未完了に戻しました',
      message: `「${item.kanji}」を今日の復習待ちに戻しました`,
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 pb-28">
        {/* 漢字テスト実行中ビュー */}
        {isKanjiTesting ? (
          <KanjiTestView
            items={activeTestItems}
            onReviewResult={handleKanjiReviewResult}
            onFinish={() => {
              setIsKanjiTesting(false);
              setMainNavMode('study'); // 学習記録画面へ戻る
              setActiveTab('today');    // 今日の復習タブに遷移
            }}
          />
        ) : (
          <>
            {/* モード①：通常学習 */}
            {mainNavMode === 'study' && (
              <>
                {/* 新規学習記録フォーム */}
                <QuickAddForm onAdd={handleAddItem} />

                {/* タブ切り替えバー */}
                <TabNav
                  currentTab={activeTab}
                  onSelectTab={setActiveTab}
                  todayCount={todayReviewItems.length}
                />

                {/* タブ別コンテンツ */}
                <div className="pt-1">
                  {activeTab === 'today' && (
                    <TodayReviewList
                      items={todayReviewItems}
                      onComplete={handleCompleteReview}
                      onDelete={handleDeleteItem}
                      onEditTitle={handleEditTitle}
                      onEditItem={handleEditItem}
                      kanjiDueCount={todayDueKanjiItems.length}
                      onStartKanjiTest={handleStartKanjiTest}
                    />
                  )}

                  {activeTab === 'upcoming' && (
                    <UpcomingList
                      items={items}
                      onRollbackStep1={handleRollbackStep1}
                      onDelete={handleDeleteItem}
                      onEditItem={handleEditItem}
                    />
                  )}

                  {activeTab === 'completed' && (
                    <CompletedList
                      items={items}
                      onRollback={handleRollbackCompleted}
                      onDelete={handleDeleteItem}
                      onEditTitle={handleEditTitle}
                    />
                  )}
                </div>
              </>
            )}

            {/* モード②：漢字学習（記録と確認専用） */}
            {mainNavMode === 'kanji' && (
              <KanjiPageView
                kanjiItems={kanjiItems}
                onKanjiAdded={handleKanjiAdded}
                onDeleteKanji={handleDeleteKanji}
                onRollbackCompletedKanji={handleRollbackCompletedKanji}
                onRollbackStep1Kanji={handleRollbackStep1Kanji}
              />
            )}
          </>
        )}
      </main>

      {/* 画面下部モード切り替えナビゲーションバー（テスト中は非表示） */}
      {!isKanjiTesting && (
        <BottomNav
          currentMode={mainNavMode}
          onSelectMode={setMainNavMode}
          studyDueCount={todayReviewItems.length + (todayDueKanjiItems.length > 0 ? 1 : 0)}
        />
      )}

      {/* トースト通知 */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ヘルプ / PWAインストールモーダル */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* データバックアップモーダル */}
      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        items={items}
        kanjiItems={kanjiItems}
        onReload={(newItems, newKanji) => {
          setItems(newItems);
          if (newKanji) setKanjiItems(newKanji);
        }}
      />
    </div>
  );
};

export default App;
