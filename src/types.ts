export interface ReviewHistory {
  step: 1 | 2;
  completedAt: string; // YYYY-MM-DD
  completedTimestamp: number;
}

export interface StudyItem {
  id: string;
  title: string;
  createdAt: string; // YYYY-MM-DD
  createdTimestamp: number;
  currentStep: 1 | 2; // 1 = 1回目の復習待ち, 2 = 2回目の復習待ち
  nextDueDate: string; // YYYY-MM-DD
  status: 'active' | 'completed';
  history: ReviewHistory[];
}

export interface KanjiItem {
  id: string;
  kanji: string;        // 漢字（例: 走る, 挨拶）
  reading: string;      // 読みがな・送り仮名（例: はしる, あいさつ）
  createdAt: string;    // 登録日 (YYYY-MM-DD)
  createdTimestamp: number;
  currentStep: 1 | 2;   // 1 = 1日後の復習待ち, 2 = 6日後の復習待ち
  nextDueDate: string;  // 次回復習日 (YYYY-MM-DD)
  status: 'active' | 'completed';
  history: ReviewHistory[];
  failCount: number;    // 忘れ/不正解の回数
  previousStepBeforeFail?: 1 | 2; // 「忘れた」を押す直前のステップ（未完了に戻す用）
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'undo';
  undoAction?: () => void;
}
