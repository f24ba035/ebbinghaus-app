import type { StudyItem } from '../types';
import { getTodayString, addDays } from './date';

const STORAGE_KEY = 'ebbinghaus_study_items_v1';

// 初期サンプルデータ（モックデータ）を動的に生成
export function getMockItems(): StudyItem[] {
  const today = getTodayString();
  return [
    {
      id: 'sample-1',
      title: '英単語 デュオ3.0 Section 1〜3',
      createdAt: addDays(today, -1),
      createdTimestamp: Date.now() - 86400000,
      currentStep: 1,
      nextDueDate: today, // 今日やるべき復習（1回目）
      status: 'active',
      history: []
    },
    {
      id: 'sample-2',
      title: '基本情報技術者 ネットワーク層の基礎',
      createdAt: addDays(today, -7),
      createdTimestamp: Date.now() - 7 * 86400000,
      currentStep: 2,
      nextDueDate: today, // 今日やるべき復習（2回目）
      status: 'active',
      history: [
        {
          step: 1,
          completedAt: addDays(today, -6),
          completedTimestamp: Date.now() - 6 * 86400000
        }
      ]
    },
    {
      id: 'sample-3',
      title: 'React Hooks（useEffectとuseCallback）',
      createdAt: today,
      createdTimestamp: Date.now(),
      currentStep: 1,
      nextDueDate: addDays(today, 1), // 今後の予定（明日）
      status: 'active',
      history: []
    },
    {
      id: 'sample-4',
      title: 'JavaScript 非同期処理（Promise/async/await）',
      createdAt: addDays(today, -10),
      createdTimestamp: Date.now() - 10 * 86400000,
      currentStep: 2,
      nextDueDate: addDays(today, -3),
      status: 'completed', // 定着済み
      history: [
        {
          step: 1,
          completedAt: addDays(today, -9),
          completedTimestamp: Date.now() - 9 * 86400000
        },
        {
          step: 2,
          completedAt: addDays(today, -3),
          completedTimestamp: Date.now() - 3 * 86400000
        }
      ]
    }
  ];
}

export function loadItems(): StudyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // 初回はサンプルデータをセット
      const mocks = getMockItems();
      saveItems(mocks);
      return mocks;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load study items from localStorage', e);
    return [];
  }
}


export function saveItems(items: StudyItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save study items to localStorage', e);
  }
}

// 新規学習を記録する
export function createStudyItem(title: string): StudyItem {
  const today = getTodayString();
  return {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title.trim(),
    createdAt: today,
    createdTimestamp: Date.now(),
    currentStep: 1,
    nextDueDate: addDays(today, 1), // 翌日（1日後）に1回目の復習
    status: 'active',
    history: []
  };
}

// 復習完了処理（動的リスケジュール）
export function progressReviewStep(item: StudyItem): { updatedItem: StudyItem; nextDateLabel: string } {
  const today = getTodayString();
  const historyEntry = {
    step: item.currentStep,
    completedAt: today,
    completedTimestamp: Date.now()
  };

  if (item.currentStep === 1) {
    // 1回目の復習完了 -> 本日起点で6日後に2回目の復習
    const nextDueDate = addDays(today, 6);
    const updatedItem: StudyItem = {
      ...item,
      currentStep: 2,
      nextDueDate,
      history: [...item.history, historyEntry]
    };
    return { updatedItem, nextDateLabel: nextDueDate };
  } else {
    // 2回目の復習完了 -> マスター（定着）完了
    const updatedItem: StudyItem = {
      ...item,
      status: 'completed',
      history: [...item.history, historyEntry]
    };
    return { updatedItem, nextDateLabel: '記憶定着完了' };
  }
}

// 定着済み（完了）を未完了状態（2回目の復習待ち）へロールバック
export function rollbackCompletedItem(item: StudyItem): StudyItem {
  const today = getTodayString();
  // 履歴から直前の step: 2 完了ログを削除
  const updatedHistory = item.history.filter((h) => h.step !== 2);

  return {
    ...item,
    status: 'active',
    currentStep: 2,
    nextDueDate: today, // 今日やるべき復習に復活
    history: updatedHistory
  };
}

// 2回目の復習待ち（6日後予定）から、1回目の復習待ち（今日）へロールバック
export function rollbackStep2ToStep1(item: StudyItem): StudyItem {
  const today = getTodayString();
  // 履歴から直前の step: 1 完了ログを削除
  const updatedHistory = item.history.filter((h) => h.step !== 1);

  return {
    ...item,
    status: 'active',
    currentStep: 1,
    nextDueDate: today, // 今日やるべき復習に復活
    history: updatedHistory
  };
}


