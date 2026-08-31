import { Product, BlogPost } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-husky-mint',
    name: 'Husky Mint Series Salt 30ml',
    category: 'Жидкости',
    city: 'Оба',
    price: 24,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Red Garden (Мята / Земляника)', price: 24 },
      { name: 'Sweet Buck (Мята / Брусника)', price: 24 },
      { name: 'Water Place (Мята / Арбуз)', price: 24 }
    ],
    characteristics: {
      volume: '30 мл',
      nicotine: '20 мг Hard',
      pgVg: '50/50'
    },
    createdAt: Date.now() - 100000
  },
  {
    id: 'prod-xros-4',
    name: 'Vaporesso XROS 4 Pod Kit',
    category: 'POD-системы',
    city: 'Оба',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Black (Черный)', price: 85 },
      { name: 'Silver (Серебряный)', price: 85 },
      { name: 'Lilac Purple (Сиреневый)', price: 85 }
    ],
    characteristics: {
      power: '30 Вт',
      tankVolume: '3 мл',
      resistance: '0.4 / 0.6 / 0.8 Ом'
    },
    createdAt: Date.now() - 90000
  },
  {
    id: 'prod-xros-cartridge',
    name: 'Картридж Vaporesso XROS Series 0.6 / 0.8 Ом',
    category: 'Испарители',
    city: 'Оба',
    price: 11,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: '0.6 Ом (Top Fill)', price: 11 },
      { name: '0.8 Ом (Top Fill)', price: 11 },
      { name: '1.2 Ом (MTL)', price: 11 }
    ],
    characteristics: {
      resistance: '0.6 Ом / 0.8 Ом',
      tankVolume: '3 мл / 2 мл'
    },
    createdAt: Date.now() - 80000
  },
  {
    id: 'prod-mad-30ml',
    name: 'MAD Salt 30ml Экстра-Холод',
    category: 'Жидкости',
    city: 'Лида',
    price: 22,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Виноградный Лед', price: 22 },
      { name: 'Ледяной Ананас', price: 22 },
      { name: 'Манго Маракуйя', price: 22 }
    ],
    characteristics: {
      volume: '30 мл',
      nicotine: '20 мг',
      pgVg: '50/50'
    },
    createdAt: Date.now() - 70000
  },
  {
    id: 'prod-geekvape-h45',
    name: 'Geekvape H45 (Aegis Hero 2)',
    category: 'POD-системы',
    city: 'Ивье',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Gunmetal', price: 110 },
      { name: 'Black', price: 110 },
      { name: 'Rainbow', price: 110 }
    ],
    characteristics: {
      power: '45 Вт',
      tankVolume: '4 мл',
      resistance: '0.3 / 0.4 Ом'
    },
    createdAt: Date.now() - 60000
  },
  {
    id: 'prod-geekvape-b-coil',
    name: 'Испаритель Geekvape B Series Coil',
    category: 'Испарители',
    city: 'Ивье',
    price: 12,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: '0.3 Ом (30-38W)', price: 12 },
      { name: '0.4 Ом (25-35W)', price: 12 }
    ],
    characteristics: {
      resistance: '0.3 Ом / 0.4 Ом'
    },
    createdAt: Date.now() - 50000
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Как правильно ухаживать за картриджами и продлить их жизнь',
    excerpt: 'Простые советы по заправке, первой пропитке испарителя и выбору подходящей жидкости.',
    content: 'Чтобы картридж служил долго и не подгорал в первые дни, соблюдайте базовые правила: после первой заправки нового картриджа обязательно подождите 10-15 минут для полной пропитки хлопкового фитиля. Не парите на морозе и следите за уровнем жидкости, не допуская полного осушения бака.',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    date: '31 августа 2026',
    readTime: '3 мин'
  },
  {
    id: 'blog-2',
    title: 'Топ POD-систем 2026 года для начинающих и профи',
    excerpt: 'Сравнение моделей Vaporesso XROS, Geekvape и других популярных устройств.',
    content: 'В 2026 году линейка Vaporesso XROS остается лидером по отсутствию протечек и вкусопередаче, в то время как Geekvape H45 предлагает непревзойденную прочность и регулировку мощности.',
    imageUrl: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=800&q=80',
    date: '28 августа 2026',
    readTime: '5 мин'
  }
];
