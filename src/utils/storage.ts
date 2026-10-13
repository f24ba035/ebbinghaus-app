import type { StudyItem } from '../types';
import { getTodayString, addDays } from './date';

const STORAGE_KEY = 'ebbinghaus_study_items_v1';

export function loadItems(): StudyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 開発用の初期モックデータ（idがsample-で始まるもの）を自動除去して本番化
    const cleaned = parsed.filter((it: StudyItem) => typeof it?.id === 'string' && !it.id.startsWith('sample-'));
    if (cleaned.length !== parsed.length) {
      saveItems(cleaned);
    }
    return cleaned;
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


