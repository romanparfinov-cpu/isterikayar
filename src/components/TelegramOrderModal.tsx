import React from 'react';

interface TelegramOrderModalProps {
  isOpen: boolean;
  orderNumber: string;
  onClose: () => void;
}

export const TelegramOrderModal: React.FC<TelegramOrderModalProps> = ({
  isOpen,
  orderNumber,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="telegram-order-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="telegram-order-modal-card"
        className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-purple-950/40 space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#7c3aed]">
          <span className="material-icons text-3xl">done_all</span>
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-widest font-bold">
            Заказ #{orderNumber}
          </span>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-3.5">
            Заказ сформирован!
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mt-2 leading-relaxed">
            Мы открыли Telegram-чат с предзаполненными данными заказа. Отправьте сообщение менеджеру для подтверждения.
          </p>
        </div>

        <div className="pt-2">
          <button
            id="telegram-order-close-btn"
            type="button"
            onClick={onClose}
            className="w-full py-4 px-6 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#7c3aed]/30 cursor-pointer"
          >
            Понятно, спасибо!
          </button>
        </div>
      </div>
    </div>
  );
};
