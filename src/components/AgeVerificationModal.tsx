import React from 'react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onConfirm,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="age-verification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in"
    >
      <div 
        id="age-verification-card"
        className="w-full max-w-[500px] bg-[#1a1a1a] border border-white/10 p-8 sm:p-12 rounded-3xl text-center flex flex-col gap-6 sm:gap-8 shadow-2xl shadow-purple-950/40"
      >
        <h2 className="text-5xl sm:text-6xl font-black italic tracking-tighter text-white">
          18+
        </h2>
        
        <p className="text-base sm:text-lg text-white/70 leading-relaxed font-medium">
          Магазин содержит продукцию, предназначенную только для совершеннолетних граждан (18+). Вам есть 18?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            id="age-verify-yes-btn"
            type="button"
            onClick={onConfirm}
            className="flex-grow py-4 bg-[#7c3aed] rounded-xl font-bold uppercase tracking-widest text-white hover:bg-[#6d28d9] transition-colors cursor-pointer shadow-lg shadow-[#7c3aed]/30 text-sm sm:text-base"
          >
            Да, мне есть 18
          </button>
          <button
            id="age-verify-no-btn"
            type="button"
            onClick={onReject}
            className="flex-grow py-4 bg-white/5 rounded-xl font-bold uppercase tracking-widest text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-sm sm:text-base"
          >
            Нет
          </button>
        </div>

        <p className="text-[10px] text-white/30 uppercase tracking-widest">
          Сайт использует файлы cookie для улучшения пользовательского опыта.
        </p>
      </div>
    </div>
  );
};
