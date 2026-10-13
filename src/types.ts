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

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'undo';
  undoAction?: () => void;
}
