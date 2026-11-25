import { City } from '../types';

export function formatPrice(price: number): string {
  return `${Number(price || 0).toFixed(2)} BYN`;
}

export function generateOrderNumber(city: City): string {
  const cityCode = city === 'Ивье' ? 'ИВЬЕ' : 'ОШМЯНЫ';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `#${cityCode}-${randomDigits}`;
}

export function createTelegramOrderUrl(
  orderNumber: string, 
  city: City, 
  items: { name: string; variantName: string; quantity: number; price: number }[], 
  total: number,
  telegramUsername: string = 'isterikaMngr'
): { url: string; orderText: string } {
  let orderText = `Номер заказа ${orderNumber}\n`;
  orderText += `Товары:\n`;

  items.forEach((item, index) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    orderText += `${index + 1}. ${item.name} (${item.variantName}) — ${item.quantity} шт. x ${item.price.toFixed(2)} BYN = ${itemTotal} BYN\n`;
  });

  orderText += `\nИтого к оплате: ${total.toFixed(2)} BYN\n`;
  orderText += `Дата: ${new Date().toLocaleString('ru-RU')}`;

  let cleanUsername = (telegramUsername || 'isterikaManager').replace('@', '').trim();
  const lower = cleanUsername.toLowerCase();
  if (!cleanUsername || lower === 'istermanager' || lower === 'istertelegram' || lower.includes('istermanager') || lower.includes('istertelegram')) {
    cleanUsername = 'isterikaManager';
  }
  const url = `https://t.me/${cleanUsername}?text=${encodeURIComponent(orderText)}`;
  
  return { url, orderText };
}
