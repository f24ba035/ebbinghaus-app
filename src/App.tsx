import React, { useState, useEffect } from 'react';
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
import type { StudyItem, ToastMessage } from './types';
import { loadItems, saveItems, createStudyItem, progressReviewStep, rollbackCompletedItem, rollbackStep2ToStep1, getMockItems } from './utils/storage';
import { getTodayString, formatJapaneseDate } from './utils/date';

export const App: React.FC = () => {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [lastStateForUndo, setLastStateForUndo] = useState<StudyItem[] | null>(null);

  // 初回読み込み
  useEffect(() => {
    const loaded = loadItems();
    setItems(loaded);
  }, []);

  const todayStr = getTodayString();

  // 「今日やるべき復習」の抽出（期日が今日以前の未完了タスクをすべて集約）
  const todayReviewItems = items.filter(
    (item) => item.status === 'active' && item.nextDueDate <= todayStr
  );

  // 新規学習の登録
  const handleAddItem = (title: string) => {
    const newItem = createStudyItem(title);
    const updated = [newItem, ...items];
    setItems(updated);
    saveItems(updated);

    showToast({
      id: String(Date.now()),
      title: '学習を記録しました',
      message: `明日（${formatJapaneseDate(newItem.nextDueDate)}）に1回目の復習をセットしました`,
      type: 'info'
    });
  };

  // 復習完了（動的リスケジュール）
  const handleCompleteReview = (targetItem: StudyItem) => {
    // Undo用の状態保存
    setLastStateForUndo([...items]);

    const { updatedItem, nextDateLabel } = progressReviewStep(targetItem);
    const updatedItems = items.map((it) => (it.id === targetItem.id ? updatedItem : it));
    setItems(updatedItems);
    saveItems(updatedItems);

    if (targetItem.currentStep === 1) {
      showToast({
        id: String(Date.now()),
        title: '1回目の復習を完了！',
        message: `次回（2回目）は ${formatJapaneseDate(nextDateLabel)}（6日後）にセットされました`,
        type: 'success',
        undoAction: handleUndo
      });
    } else {
      showToast({
        id: String(Date.now()),
        title: '全ステップ達成！🎉',
        message: `「${targetItem.title}」の記憶定着が完了しました`,
        type: 'success',
        undoAction: handleUndo
      });
    }
  };

  // 完了の取り消し (Undo)
  const handleUndo = () => {
    if (lastStateForUndo) {
      setItems(lastStateForUndo);
      saveItems(lastStateForUndo);
      setLastStateForUndo(null);
      showToast({
        id: String(Date.now()),
        title: '元に戻しました',
        message: '直前の操作を取り消しました',
        type: 'info'
      });
    }
  };

  // 削除
  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveItems(updated);
    showToast({
      id: String(Date.now()),
      title: '削除しました',
      message: '学習項目を削除しました',
      type: 'info'
    });
  };

  // タイトル編集
  const handleEditTitle = (id: string, newTitle: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, title: newTitle } : it));
    setItems(updated);
    saveItems(updated);
  };

  // 定着済みから未完了（2回目の復習）へのロールバック
  const handleRollbackCompleted = (item: StudyItem) => {
    const rolledBack = rollbackCompletedItem(item);
    const updated = items.map((it) => (it.id === item.id ? rolledBack : it));
    setItems(updated);
    saveItems(updated);

    showToast({
      id: String(Date.now()),
      title: '未完了に戻しました',
      message: `「${item.title}」を2回目の復習待ち（今日やるべき復習）に戻しました`,
      type: 'info'
    });
  };

  // 2回目の復習待ち（今後の予定）から1回目の復習待ち（今日の復習）へのロールバック
  const handleRollbackStep1 = (item: StudyItem) => {
    const rolledBack = rollbackStep2ToStep1(item);
    const updated = items.map((it) => (it.id === item.id ? rolledBack : it));
    setItems(updated);
    saveItems(updated);

    showToast({
      id: String(Date.now()),
      title: '未完了に戻しました',
      message: `「${item.title}」を1回目の復習待ち（今日やるべき復習）に戻しました`,
      type: 'info'
    });
  };

  // モック（サンプル）データの読み込み
  const handleLoadMockData = () => {
    const mocks = getMockItems();
    setItems(mocks);
    saveItems(mocks);
    setActiveTab('today');
    showToast({
      id: String(Date.now()),
      title: 'サンプルデータを読み込みました',
      message: '動作確認用の学習記録（全4件）をセットしました',
      type: 'info'
    });
  };

  // トースト表示管理
  const showToast = (toastMsg: ToastMessage) => {
    setToast(toastMsg);
    // 5秒後に自動消滅
    setTimeout(() => {
      setToast((prev) => (prev?.id === toastMsg.id ? null : prev));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 pb-20">
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
              onLoadMock={handleLoadMockData}
            />
          )}

          {activeTab === 'upcoming' && (
            <UpcomingList items={items} onRollbackStep1={handleRollbackStep1} />
          )}

          {activeTab === 'completed' && (
            <CompletedList
              items={items}
              onRollback={handleRollbackCompleted}
              onDelete={handleDeleteItem}
            />
          )}
        </div>
      </main>

      {/* トースト通知 */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ヘルプ / PWAインストールモーダル */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* データバックアップモーダル */}
      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        items={items}
        onReload={(newItems) => setItems(newItems)}
      />
    </div>
  );
};

export default App;
