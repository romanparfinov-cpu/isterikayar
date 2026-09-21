import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, City, Order } from '../types';
import { formatPrice, generateOrderNumber, createTelegramOrderUrl } from '../utils/format';
import { addOrderToDB } from '../services/firebase';

interface CartModalProps {
  isOpen: boolean;
  city: City;
  cartItems: CartItem[];
  telegramUsername: string;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderCompleted: (orderNumber: string, telegramUrl?: string, orderText?: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  city,
  cartItems,
  telegramUsername,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const totalSum = cartItems.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);

  const [orderNumber, setOrderNumber] = useState(() => generateOrderNumber(city));

  useEffect(() => {
    if (isOpen) {
      setOrderNumber(generateOrderNumber(city));
    }
  }, [isOpen, city]);

  const orderItems = useMemo(() => {
    return cartItems.map((item) => ({
      name: item.name,
      variantName: item.variant.name,
      quantity: item.quantity,
      price: item.variant.price,
    }));
  }, [cartItems]);

  let cleanUsername = (telegramUsername || 'isterikaMngr').replace('@', '').trim();
  const lower = cleanUsername.toLowerCase();
  if (
    !cleanUsername ||
    lower === 'istermanager' ||
    lower === 'istertelegram' ||
    lower.includes('istermanager') ||
    lower.includes('istertelegram')
  ) {
    cleanUsername = 'isterikaMngr';
  }

  const { url: telegramUrl, orderText } = useMemo(() => {
    return createTelegramOrderUrl(orderNumber, city, orderItems, totalSum, cleanUsername);
  }, [orderNumber, city, orderItems, totalSum, cleanUsername]);

  const handleCheckoutTelegram = (e: React.MouseEvent) => {
    if (cartItems.length === 0) {
      e.preventDefault();
      return;
    }

    // Save order to DB asynchronously in background
    const newOrder: Omit<Order, 'id' | 'createdAt'> = {
      orderNumber,
      items: cartItems,
      totalSum,
      city,
      status: 'new',
    };
    addOrderToDB(newOrder).catch((err) => console.warn('addOrderToDB warning:', err));

    // Also attempt window.open just in case
    try {
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    } catch {}

    // Complete order flow and display success confirmation modal with direct link & copy button
    onOrderCompleted(orderNumber, telegramUrl, orderText);
  };

  return (
    <div
      id="cart-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-[4px] animate-in fade-in"
    >
      <div
        id="cart-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#161616] border border-[#2c2c2c] rounded-[12px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center shadow-md">
              <span className="material-icons text-xl">shopping_cart</span>
            </div>
            <div>
              <h2 className="font-black uppercase tracking-tight text-white text-lg sm:text-xl leading-tight">
                Корзина заказов
              </h2>
              <span className="text-xs uppercase font-bold tracking-wider text-white/50">
                Город: <strong className="text-[#7c3aed]">{city}</strong>
              </span>
            </div>
          </div>

          <button
            id="cart-modal-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-white/10">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-white/50 space-y-3">
              <span className="material-icons text-5xl text-neutral-600">remove_shopping_cart</span>
              <p className="text-base font-bold uppercase tracking-wider text-white">Ваша корзина пуста</p>
              <p className="text-xs text-white/40">Добавьте понравившиеся товары из каталога</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemTotal = item.variant.price * item.quantity;
              return (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3">
                  {/* Photo 50x50 */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-[50px] h-[50px] rounded-lg object-cover bg-[#222] shrink-0 border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=100&q=80';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] truncate">
                      {item.variant.name}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {formatPrice(item.variant.price)} / шт.
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-[#202020] border border-white/10 rounded-lg p-1">
                    <button
                      id={`cart-qty-minus-${item.id}`}
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="material-icons text-sm">remove</span>
                    </button>
                    <span className="text-xs font-black text-white px-1 min-w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      id={`cart-qty-plus-${item.id}`}
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="material-icons text-sm">add</span>
                    </button>
                  </div>

                  {/* Item total and delete */}
                  <div className="text-right shrink-0 min-w-16">
                    <div className="text-xs sm:text-sm font-black text-[#7c3aed]">
                      {formatPrice(itemTotal)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-red-400 transition-colors mt-0.5 cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Total and Telegram Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141414] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs uppercase font-bold tracking-widest text-white/50">Итого к оплате:</span>
              <span className="text-2xl font-black text-[#7c3aed] tracking-tight">
                {formatPrice(totalSum)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClearCart}
                className="px-3.5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/50 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                title="Очистить всю корзину"
              >
                <span className="material-icons text-base">delete_outline</span>
              </button>
              
              <a
                id="cart-checkout-telegram-btn"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCheckoutTelegram}
                className="flex-1 py-4 px-4 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#7c3aed]/30 transition-all active:scale-[0.99] cursor-pointer no-underline text-center"
              >
                <span className="material-icons text-lg">send</span>
                Оформить заказ в Telegram
              </a>
            </div>
            
            <p className="text-[10px] uppercase tracking-wider text-center text-white/40">
              Менеджер свяжется в Telegram для подтверждения и передачи заказа.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
