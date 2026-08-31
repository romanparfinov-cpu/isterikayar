import React from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            id={`toast-${t.id}`}
            onClick={() => onDismiss(t.id)}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 cursor-pointer ${
              isSuccess
                ? 'bg-[#14291e]/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : isError
                ? 'bg-[#2d1419]/95 border-red-500/40 text-red-100 shadow-red-950/40'
                : 'bg-[#1e172e]/95 border-[#7c3aed]/40 text-purple-100 shadow-purple-950/40'
            }`}
          >
            <span
              className={`material-icons text-xl shrink-0 ${
                isSuccess ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-[#7c3aed]'
              }`}
            >
              {isSuccess ? 'check_circle' : isError ? 'error_outline' : 'info'}
            </span>

            <p className="text-xs sm:text-sm font-medium flex-1 leading-snug">
              {t.message}
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(t.id);
              }}
              className="text-neutral-400 hover:text-white shrink-0 p-1"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
