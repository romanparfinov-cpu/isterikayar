import React, { useState } from 'react';

interface TelegramOrderModalProps {
  isOpen: boolean;
  orderNumber: string;
  telegramUrl?: string;
  orderText?: string;
  onClose: () => void;
}

export const TelegramOrderModal: React.FC<TelegramOrderModalProps> = ({
  isOpen,
  orderNumber,
  telegramUrl,
  orderText,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (orderText) {
      navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="telegram-order-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="telegram-order-modal-card"
        className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-purple-950/40 space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center mx-auto text-[#a78bfa]">
          <span className="material-icons text-3xl">done_all</span>
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-widest font-bold">
            Заказ {orderNumber}
          </span>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-3.5">
            Заказ сформирован!
          </h3>
          <p className="text-white/70 text-xs sm:text-sm mt-2 leading-relaxed">
            Мы подготовили детали заказа для отправки менеджеру в Telegram. Отправьте сообщение для подтверждения и согласования получения.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          {telegramUrl && (
            <a
              id="telegram-order-open-link"
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-widest text-xs sm:text-sm transition-all shadow-lg shadow-[#7c3aed]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-icons text-base">send</span>
              Перейти в Telegram
            </a>
          )}

          {orderText && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-icons text-sm">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Текст заказа скопирован в буфер!' : 'Скопировать текст заказа'}
            </button>
          )}

          <button
            id="telegram-order-close-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold uppercase tracking-widest text-xs transition-all cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

