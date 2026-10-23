import type { StudyItem } from '../types';
import { getTodayString, addDays } from './date';

const STORAGE_KEY = 'ebbinghaus_study_items_v1';

export function loadItems(): StudyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
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

// ----------------------------------------------------
// 漢字学習用ストレージ & エビングハウスロジック
// ----------------------------------------------------
import type { KanjiItem } from '../types';

const KANJI_STORAGE_KEY = 'ebbinghaus_kanji_items_v1';

export function loadKanjiItems(): KanjiItem[] {
  try {
    const raw = localStorage.getItem(KANJI_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error('Failed to load kanji items from localStorage', e);
    return [];
  }
}

export function saveKanjiItems(items: KanjiItem[]): void {
  try {
    localStorage.setItem(KANJI_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save kanji items to localStorage', e);
  }
}

// 漢字を新規作成（明日の復習対象として生成）
export function createKanjiItem(reading: string, kanji: string): KanjiItem {
  const today = getTodayString();
  return {
    id: 'kanji_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    reading: reading.trim(),
    kanji: kanji.trim(),
    createdAt: today,
    createdTimestamp: Date.now(),
    currentStep: 1,
    nextDueDate: addDays(today, 1), // 明日（1日後）に1回目の復習
    status: 'active',
    history: [],
    failCount: 0
  };
}

// 漢字復習結果の反映（覚えていた場合 & 忘れていた場合）
export function processKanjiReview(
  item: KanjiItem,
  remembered: boolean
): { updatedItem: KanjiItem; resultMessage: string } {
  const today = getTodayString();

  if (remembered) {
    // 【覚えている場合】エビングハウス忘却曲線に沿ってステップを進める
    const historyEntry = {
      step: item.currentStep,
      completedAt: today,
      completedTimestamp: Date.now()
    };

    if (item.currentStep === 1) {
      // 1日後クリア -> 6日後へ
      const nextDueDate = addDays(today, 6);
      const updatedItem: KanjiItem = {
        ...item,
        currentStep: 2,
        nextDueDate,
        history: [...item.history, historyEntry]
      };
      return { updatedItem, resultMessage: '次回は6日後に出題されます' };
    } else {
      // 6日後クリア -> 定着完了（マスター）
      const updatedItem: KanjiItem = {
        ...item,
        status: 'completed',
        history: [...item.history, historyEntry]
      };
      return { updatedItem, resultMessage: '記憶定着完了！' };
    }
  } else {
    // 【忘れていた場合】翌日（明日）に再度1日後復習として出題
    const nextDueDate = addDays(today, 1);
    const updatedItem: KanjiItem = {
      ...item,
      previousStepBeforeFail: item.currentStep, // 直前のステップを記憶（未完了に戻す用）
      currentStep: 1,
      nextDueDate,
      failCount: (item.failCount || 0) + 1
    };
    return { updatedItem, resultMessage: '明日再度出題されます' };
  }
}

// 漢字の定着済み（完了）を未完了状態（2回目の復習待ち）へロールバック
export function rollbackCompletedKanjiItem(item: KanjiItem): KanjiItem {
  const today = getTodayString();
  const updatedHistory = item.history.filter((h) => h.step !== 2);

  return {
    ...item,
    status: 'active',
    currentStep: 2,
    nextDueDate: today, // 今日やるべき復習に復活
    history: updatedHistory
  };
}

// 漢字の「忘れた」判定、または2回目復習待ちから未完了状態（今日やるべき復習）へロールバック
export function rollbackToPreviousReviewKanji(item: KanjiItem): KanjiItem {
  const today = getTodayString();

  if (item.previousStepBeforeFail === 2) {
    // 2回目だったのに間違えて「忘れた」を押してしまった場合 -> 2回目の復習（今日）に戻す
    return {
      ...item,
      currentStep: 2,
      nextDueDate: today,
      previousStepBeforeFail: undefined,
      failCount: Math.max(0, (item.failCount || 1) - 1)
    };
  } else if (item.previousStepBeforeFail === 1) {
    // 1回目で「忘れた」を押して明日になってしまった場合 -> 1回目の復習（今日）に戻す
    return {
      ...item,
      currentStep: 1,
      nextDueDate: today,
      previousStepBeforeFail: undefined,
      failCount: Math.max(0, (item.failCount || 1) - 1)
    };
  }

  // 1回目完了して2回目待ち（6日後）から1回目（今日）に戻す場合
  const updatedHistory = item.history.filter((h) => h.step !== 1);
  return {
    ...item,
    status: 'active',
    currentStep: 1,
    nextDueDate: today,
    history: updatedHistory
  };
}




