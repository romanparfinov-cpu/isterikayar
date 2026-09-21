import React from 'react';
import { Product, ProductVariant } from '../types';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onQuickAdd,
}) => {
  const hasVariants = product.variants && product.variants.length > 0;

  const lowestPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  const totalStock =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((acc, v) => acc + (v.stock ?? 0), 0)
      : (product.stock ?? 0);

  const isOutOfStock = totalStock <= 0;

  const defaultVariant: ProductVariant = product.variants && product.variants.length > 0
    ? (product.variants.find((v) => (v.stock ?? 0) > 0) || product.variants[0])
    : { name: 'Стандарт', price: product.price, stock: product.stock };

  const handleCardClick = () => {
    if (hasVariants || isOutOfStock) {
      onOpenDetail(product);
    } else {
      onQuickAdd(product, defaultVariant);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVariants || isOutOfStock) {
      onOpenDetail(product);
    } else {
      onQuickAdd(product, defaultVariant);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="bg-[#1a1a1a] rounded-xl overflow-hidden group border border-white/10 hover:border-[#7c3aed]/50 transition-all duration-200 flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-purple-950/30"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full bg-gradient-to-tr from-[#242424] to-[#1a1a1a] overflow-hidden flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex gap-1.5 items-center flex-wrap">
          <span className="text-[10px] sm:text-xs bg-[#7c3aed] text-white px-2 py-0.5 rounded uppercase font-bold tracking-tight shadow-md">
            {product.category}
          </span>
          {product.city === 'Оба' ? (
            <span className="text-[10px] sm:text-xs bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded uppercase font-bold tracking-tight border border-white/10">
              Ивье • Лида
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs bg-black/60 backdrop-blur-md text-neutral-300 px-2 py-0.5 rounded uppercase font-bold tracking-tight border border-white/10">
              {product.city}
            </span>
          )}
        </div>

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
            <span className="material-icons text-4xl mb-2">image_not_supported</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Нет фото</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-1">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.characteristics?.nicotine && (
            <p className="text-white/50 text-xs uppercase font-semibold tracking-wider mt-1 truncate">
              {product.characteristics.nicotine}
            </p>
          )}
          {isOutOfStock ? (
            <p className="text-red-400 text-xs font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Нет в наличии
            </p>
          ) : (
            <p className="text-white/60 text-xs font-medium mt-1">
              В наличии: <span className="text-emerald-400 font-bold">{totalStock} шт.</span>
              {product.variants && product.variants.length > 0 && (
                <span className="text-white/40 ml-1">
                  ({product.variants.length} {product.category === 'Жидкости' || product.category === 'Снюс' ? 'вкус.' : 'вар.'})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider block">
              цена
            </span>
            <span className="text-[#7c3aed] font-black text-lg sm:text-xl tracking-tight">
              {formatPrice(lowestPrice)}
            </span>
          </div>
          <button
            id={`product-add-btn-${product.id}`}
            type="button"
            onClick={handleButtonClick}
            title={
              isOutOfStock
                ? 'Нет в наличии'
                : hasVariants
                ? 'Выбрать вариант'
                : 'Добавить в корзину'
            }
            className={`p-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center active:scale-95 shadow-md ${
              isOutOfStock
                ? 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700 hover:text-white'
                : 'bg-white text-black hover:bg-[#7c3aed] hover:text-white'
            }`}
          >
            <span className="material-icons text-xl">
              {isOutOfStock ? 'visibility' : 'add_shopping_cart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
