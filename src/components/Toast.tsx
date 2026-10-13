import React from 'react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">{toast.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug break-words">
              {toast.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();
                onClose();
              }}
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              元に戻す
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
