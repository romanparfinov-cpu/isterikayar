import React, { useState } from 'react';
import { subscribeEmail } from '../services/firebase';

interface FooterProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  telegramUsername?: string;
}

export const Footer: React.FC<FooterProps> = ({ onShowToast, telegramUsername = 'ISTERTELEGRAM' }) => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const cleanTelegramUsername = telegramUsername.replace('@', '');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      onShowToast('Введите корректный email адрес', 'error');
      return;
    }

    try {
      setIsSubscribing(true);
      await subscribeEmail(email.trim());
      onShowToast('Вы успешно подписались на акции и новинки!', 'success');
      setEmail('');
    } catch (err) {
      console.error(err);
      onShowToast('Ошибка при оформлении подписки', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer id="main-footer" className="mt-20 border-t border-white/10 bg-[#141414] text-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand and Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-[#7c3aed] uppercase">
                ISTERIKA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm">
              Премиальный вейп-шоп с доставкой и самовывозом в г. Ивье и г. Лида. Оригинальные жидкости, POD-девайсы и расходные материалы.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs uppercase font-bold tracking-widest text-white/60">
              <span>г. Ивье</span>
              <span>•</span>
              <span>г. Лида</span>
            </div>
          </div>

          {/* Telegram and Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Связь и заказ в Telegram
            </h4>
            <p className="text-xs text-white/60">
              Прием заказов и оперативная консультация без выходных:
            </p>
            <a
              id="footer-telegram-link"
              href={`https://t.me/${cleanTelegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-all hover:shadow-lg hover:shadow-[#7c3aed]/20"
            >
              <span className="material-icons text-base">near_me</span>
              @{cleanTelegramUsername}
            </a>
          </div>

          {/* Email Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              E-mail рассылка и скидки
            </h4>
            <p className="text-xs text-white/60">
              Получайте информацию о поступлениях и закрытых промокодах:
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 items-center">
              <input
                id="footer-subscribe-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail рассылка"
                className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#7c3aed] outline-none"
              />
              <button
                id="footer-subscribe-btn"
                type="submit"
                disabled={isSubscribing}
                title="Подписаться"
                className="bg-[#7c3aed] text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center hover:bg-[#6d28d9] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? (
                  <span className="material-icons text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-icons text-base">send</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Warning and Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs uppercase tracking-widest text-white/40">
          <p className="text-center sm:text-left">
            18+ Продажа несовершеннолетним строго запрещена
          </p>
          <p className="shrink-0 font-bold">
            © 2026 ISTERIKA. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};
