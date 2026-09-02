import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { formatPrice } from '../utils/format';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedVariant: ProductVariant) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Initialize selected variant when product changes or modal opens
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Pick first in-stock variant, or first variant if none in stock
      const firstAvailable = product.variants.find((v) => (v.stock ?? 0) > 0) || product.variants[0];
      setSelectedVariant(firstAvailable);
    } else if (product) {
      setSelectedVariant({
        name: 'Стандарт',
        price: product.price,
        stock: product.stock,
      });
    } else {
      setSelectedVariant(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant?.stock !== undefined
    ? selectedVariant.stock
    : (product.stock ?? 0);
  const isCurrentOutOfStock = currentStock <= 0;

  const handleAdd = () => {
    if (isCurrentOutOfStock) return;
    const variantToAdd = selectedVariant || (product.variants?.[0] ?? { name: 'Стандарт', price: product.price, stock: product.stock });
    onAddToCart(product, variantToAdd);
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <div
      id="product-detail-modal-overlay"
      onClick={handleCloseModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-[4px] overflow-y-auto animate-in fade-in"
    >
      <div
        id="product-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#161616] border border-[#2c2c2c] rounded-[12px] overflow-hidden shadow-2xl my-auto text-left"
      >
        {/* Close Button */}
        <button
          id="product-detail-close-btn"
          type="button"
          onClick={handleCloseModal}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
        >
          <span className="material-icons text-xl">close</span>
        </button>

        {/* Large Image on Top */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-tr from-[#242424] to-[#1a1a1a] overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
              <span className="material-icons text-6xl mb-2">image_not_supported</span>
              <span className="text-xs uppercase font-bold tracking-widest">Нет фото</span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#161616] to-transparent pointer-events-none" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-[#7c3aed] text-white rounded-md shadow-md">
              {product.category}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium bg-black/70 backdrop-blur-md text-neutral-300 rounded-md border border-white/10">
              Город: {product.city}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Title & Price & Stock */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
              {product.name}
            </h2>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#7c3aed] tracking-tight">
                  {formatPrice(currentPrice)}
                </span>
                {selectedVariant && (
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                    ({selectedVariant.name})
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div>
                {isCurrentOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/40 text-red-400 border border-red-800/40 text-xs font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Нет в наличии
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    В наличии: {currentStock} шт.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Characteristics & Specs */}
          {product.characteristics && Object.keys(product.characteristics).length > 0 && (
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 text-xs space-y-2.5">
              <div className="font-bold text-white mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest">
                <span className="material-icons text-sm text-[#7c3aed]">tune</span>
                Характеристики
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-neutral-300">
                {product.characteristics.power && (
                  <div>
                    <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Мощность:</span>
                    <span className="font-bold text-white">{product.characteristics.power}</span>
                  </div>
                )}
                {product.characteristics.resistance && (
                  <div>
                    <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Сопротивление:</span>
                    <span className="font-bold text-white">{product.characteristics.resistance}</span>
                  </div>
                )}
                {product.characteristics.tankVolume && (
                  <div>
                    <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Объем бака / АКБ:</span>
                    <span className="font-bold text-white">{product.characteristics.tankVolume}</span>
                  </div>
                )}
                {product.characteristics.pgVg && (
                  <div>
                    <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Соотношение PG/VG:</span>
                    <span className="font-bold text-white">{product.characteristics.pgVg}</span>
                  </div>
                )}
                {product.characteristics.nicotine && (
                  <div>
                    <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Крепость:</span>
                    <span className="font-bold text-white">{product.characteristics.nicotine}</span>
                  </div>
                )}
                {product.characteristics.volume && (
                  <div>
                    <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Объем флакона:</span>
                    <span className="font-bold text-white">{product.characteristics.volume}</span>
                  </div>
                )}
                <div>
                  <span className="text-white/40 uppercase font-semibold text-[10px] tracking-wider block">Выбранный вкус:</span>
                  <span className={`font-bold ${isCurrentOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isCurrentOutOfStock ? '0 шт. (нет)' : `${currentStock} шт.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2.5">
                Выберите вкус / вариант:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {product.variants.map((v, idx) => {
                  const isSelected = selectedVariant?.name === v.name;
                  const vStock = v.stock !== undefined ? v.stock : 0;
                  const isOutOfStock = vStock <= 0;

                  return (
                    <button
                      key={idx}
                      id={`variant-btn-${idx}`}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white shadow-sm ring-1 ring-[#7c3aed]'
                          : isOutOfStock
                          ? 'bg-[#181818]/60 border-white/5 text-neutral-500 hover:border-white/10'
                          : 'bg-[#1c1c1c] border-white/10 text-neutral-300 hover:bg-[#252525] hover:border-white/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="truncate">{v.name}</div>
                        <div className="text-[10px] mt-0.5 font-normal">
                          {isOutOfStock ? (
                            <span className="text-red-400 font-bold">Нет в наличии</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">{vStock} шт.</span>
                          )}
                        </div>
                      </div>
                      <span className={`font-black shrink-0 ${isSelected ? 'text-[#a78bfa]' : isOutOfStock ? 'text-neutral-500' : 'text-white/60'}`}>
                        {formatPrice(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add To Cart Action */}
          <div className="pt-3">
            <button
              id="product-detail-add-to-cart-btn"
              type="button"
              onClick={handleAdd}
              disabled={isCurrentOutOfStock}
              className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isCurrentOutOfStock
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg shadow-[#7c3aed]/30 active:scale-[0.99]'
              }`}
            >
              <span className="material-icons text-xl">
                {isCurrentOutOfStock ? 'block' : 'add_shopping_cart'}
              </span>
              {isCurrentOutOfStock
                ? 'Этот вкус закончился'
                : `Добавить в корзину • ${formatPrice(currentPrice)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
