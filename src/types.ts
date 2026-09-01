export type City = 'Ивье' | 'Лида';
export type ProductCity = 'Ивье' | 'Лида' | 'Оба';

export type Category = 'Жидкости' | 'POD-системы' | 'Испарители';
export type ActiveTab = 'Главная' | 'Жидкости' | 'POD-системы' | 'Испарители' | 'Блог';

export interface ProductVariant {
  name: string;
  price: number;
  stock?: number;
}

export interface ProductCharacteristics {
  power?: string;       // Мощность (Вт)
  resistance?: string;  // Сопротивление (Ом)
  tankVolume?: string;  // Объем бака (мл)
  pgVg?: string;        // PG/VG
  nicotine?: string;    // Крепость
  volume?: string;      // Объем
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  city: ProductCity;
  price: number;
  imageUrl: string;
  variants: ProductVariant[];
  characteristics: ProductCharacteristics;
  stock?: number;
  createdAt?: number;
}

export interface CartItem {
  id: string; // unique item id: product.id + variant.name
  productId: string;
  name: string;
  category: Category;
  variant: ProductVariant;
  quantity: number;
  imageUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  readTime: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totalSum: number;
  city: City;
  status: 'new' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface AppSettings {
  telegramUsername: string;
}
