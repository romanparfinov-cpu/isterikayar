import React from 'react';
import { Category } from '../types';
import { VapeIcon, CartridgeIcon, JuiceBottleIcon } from './Icons';

interface CategoryQuickNavProps {
  selectedCategory: Category | null;
  onSelectCategory: (cat: Category | null) => void;
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: { name: Category; icon: React.ReactNode; desc: string; isHot?: boolean }[] = [
    { name: 'Жидкости', icon: <JuiceBottleIcon />, desc: 'Солевые и щелочные миксы', isHot: true },
    { name: 'POD-системы', icon: <VapeIcon />, desc: 'Компактные девайсы и наборы' },
    { name: 'Испарители', icon: <CartridgeIcon />, desc: 'Картриджи, койлы и расходники' },
  ];

  return (
    <div id="category-quick-nav" className="mb-4 sm:mb-8">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h2 className="text-xs sm:text-lg font-black uppercase italic tracking-tight sm:tracking-tighter text-white flex items-center gap-1.5 sm:gap-2">
          <span className="text-[#7c3aed] text-base sm:text-xl font-black">/</span>
          Категории каталога
        </h2>
        {selectedCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#7c3aed] hover:text-[#9061f9] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-icons text-xs">close</span>
            Все товары
          </button>
        ) : (
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-white/40">
            Все товары
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              id={`quick-cat-btn-${cat.name}`}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat.name)}
              className={`p-2 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2.5 transition-all duration-200 cursor-pointer text-center relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white shadow-lg shadow-purple-950/40 scale-[1.01]'
                  : 'bg-[#161616] border border-white/10 hover:border-[#7c3aed] hover:bg-[#1a1a1a] text-white'
              }`}
            >
              <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-transform group-hover:scale-105 ${isActive ? 'bg-white/20' : 'bg-white/5 text-[#7c3aed]'}`}>
                <span className="text-xl sm:text-3xl flex items-center justify-center w-6 h-6 sm:w-10 sm:h-10">{cat.icon}</span>
              </div>
              <div className="flex flex-col items-center w-full px-0.5">
                <span className="font-bold sm:font-black uppercase tracking-tight sm:tracking-widest text-[11px] sm:text-base block truncate w-full">
                  {cat.name}
                </span>
                <span className={`hidden sm:block text-[11px] uppercase tracking-wider mt-0.5 ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                  {cat.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

