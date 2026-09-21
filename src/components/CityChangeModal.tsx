import React from 'react';
import { City } from '../types';

interface CityChangeModalProps {
  isOpen: boolean;
  targetCity: City | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CityChangeModal: React.FC<CityChangeModalProps> = ({
  isOpen,
  targetCity,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="city-change-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div 
        id="city-change-card"
        className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-7 text-center shadow-2xl shadow-purple-950/40"
      >
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#7c3aed]">
          <span className="material-icons text-2xl">location_city</span>
        </div>

        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
          Смена города: {targetCity}
        </h3>

        <p className="text-white/70 text-xs uppercase font-medium tracking-wide mb-6">
          При смене города корзина будет автоматически очищена. Продолжить?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="city-change-cancel-btn"
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border border-white/10"
          >
            Отмена
          </button>
          <button
            id="city-change-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-[#7c3aed]/25 cursor-pointer"
          >
            Да, сменить
          </button>
        </div>
      </div>
    </div>
  );
};
