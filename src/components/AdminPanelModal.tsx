import React, { useState, useEffect } from 'react';
import { Product, Category, ProductCity, ProductVariant, ProductCharacteristics, Order, BlogPost } from '../types';
import { formatPrice } from '../utils/format';
import { uploadProductImage, fetchOrders, updateSettingsInDB, updateOrderStatusInDB } from '../services/firebase';

interface AdminPanelModalProps {
  isOpen: boolean;
  products: Product[];
  blogPosts: BlogPost[];
  telegramUsername: string;
  onClose: () => void;
  onSaveProduct: (product: Omit<Product, 'id'>, id?: string) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveBlogPost: (post: Omit<BlogPost, 'id'>, id?: string) => Promise<void>;
  onDeleteBlogPost: (id: string) => Promise<void>;
  onSettingsChange: (newUsername: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  products,
  blogPosts,
  telegramUsername,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  onSaveBlogPost,
  onDeleteBlogPost,
  onSettingsChange,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'edit' | 'orders' | 'settings' | 'blogs' | 'edit-blog'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Form states (Product)
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Жидкости');
  const [city, setCity] = useState<ProductCity>('Оба');
  const [price, setPrice] = useState<number>(25.00);
  const [imageUrl, setImageUrl] = useState('');
  const [variantsText, setVariantsText] = useState('');
  
  // Form states (Blog)
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('5 мин');
  
  // Characteristics
  const [power, setPower] = useState('');
  const [resistance, setResistance] = useState('');
  const [tankVolume, setTankVolume] = useState('');
  const [pgVg, setPgVg] = useState('50/50');
  const [nicotine, setNicotine] = useState('');
  const [volume, setVolume] = useState('30 мл');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Orders and Settings states
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [localTelegram, setLocalTelegram] = useState(telegramUsername);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen) {
      setLocalTelegram(telegramUsername);
    }
  }, [isOpen, telegramUsername]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      onShowToast('Ошибка при загрузке заказов', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusInDB(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      onShowToast('Статус заказа обновлен', 'success');
    } catch (e) {
      onShowToast('Ошибка при обновлении статуса', 'error');
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettingsInDB({ telegramUsername: localTelegram });
      onSettingsChange(localTelegram);
      onShowToast('Настройки сохранены', 'success');
    } catch (e) {
      onShowToast('Ошибка при сохранении настроек', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Helper to open form in create or edit mode
  const openCreateForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Жидкости');
    setCity('Оба');
    setPrice(25.00);
    setImageUrl('https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80');
    setVariantsText('Клубника 3мг 30мл 25.00\nЧерника Лед 3мг 30мл 25.00');
    setPower('');
    setResistance('');
    setTankVolume('');
    setPgVg('50/50');
    setNicotine('20 мг');
    setVolume('30 мл');
    setActiveTab('edit');
  };

  const openEditForm = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setCategory(prod.category);
    setCity(prod.city);
    setPrice(prod.price);
    setImageUrl(prod.imageUrl);

    // Convert variants array to lines
    const varLines = (prod.variants || [])
      .map(v => `${v.name} ${v.price.toFixed(2)}`)
      .join('\n');
    setVariantsText(varLines);

    setPower(prod.characteristics?.power || '');
    setResistance(prod.characteristics?.resistance || '');
    setTankVolume(prod.characteristics?.tankVolume || '');
    setPgVg(prod.characteristics?.pgVg || '');
    setNicotine(prod.characteristics?.nicotine || '');
    setVolume(prod.characteristics?.volume || '');

    setActiveTab('edit');
  };

  const openCreateBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogImageUrl('');
    setBlogReadTime('5 мин');
    setActiveTab('edit-blog');
  };

  const openEditBlogForm = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setBlogTitle(post.title);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogImageUrl(post.imageUrl);
    setBlogReadTime(post.readTime);
    setActiveTab('edit-blog');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadedUrl紧 = await uploadProductImage(file);
      setImageUrl(uploadedUrl紧);
      onShowToast('Изображение успешно загружено', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Ошибка загрузки фото', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const parseVariants = (text: string, basePrice: number): ProductVariant[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return [{ name: 'Стандарт', price: basePrice }];
    }

    const variants: ProductVariant[] = [];
    for (const line of lines) {
      // Find last number in string as price (e.g. "Клубника 20мг 24.50" => name: "Клубника 20мг", price: 24.50)
      const match = line.match(/^(.*?)(?:\s+([\d.,]+))$/);
      if (match) {
        const vName = match[1].trim();
        const vPrice = parseFloat(match[2].replace(',', '.'));
        variants.push({
          name: vName || 'Вариант',
          price: isNaN(vPrice) ? basePrice : vPrice
        });
      } else {
        variants.push({
          name: line,
          price: basePrice
        });
      }
    }
    return variants.length > 0 ? variants : [{ name: 'Стандарт', price: basePrice }];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Пожалуйста, укажите название товара', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedVariants = parseVariants(variantsText, Number(price));

      const characteristics: ProductCharacteristics = {
        ...(power ? { power } : {}),
        ...(resistance ? { resistance } : {}),
        ...(tankVolume ? { tankVolume } : {}),
        ...(pgVg ? { pgVg } : {}),
        ...(nicotine ? { nicotine } : {}),
        ...(volume ? { volume } : {}),
      };

      const productPayload: Omit<Product, 'id'> = {
        name: name.trim(),
        category,
        city,
        price: Number(price),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
        variants: parsedVariants,
        characteristics,
        createdAt: Date.now()
      };

      await onSaveProduct(productPayload, editingId || undefined);
      onShowToast(editingId ? 'Товар успешно обновлен' : 'Товар успешно добавлен', 'success');
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      onShowToast('Ошибка при сохранении товара', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) {
      onShowToast('Заголовок и контент обязательны', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const postPayload: Omit<BlogPost, 'id'> = {
        title: blogTitle.trim(),
        excerpt: blogExcerpt.trim(),
        content: blogContent.trim(),
        imageUrl: blogImageUrl.trim() || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
        date: new Date().toISOString().split('T')[0],
        readTime: blogReadTime.trim() || '5 мин',
      };

      await onSaveBlogPost(postPayload, editingBlogId || undefined);
      
      onShowToast(editingBlogId ? 'Статья обновлена' : 'Статья добавлена', 'success');
      setActiveTab('blogs');
      setEditingBlogId(null);
    } catch (err) {
      console.error(err);
      onShowToast('Ошибка при сохранении статьи', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${prodName}"?`)) {
      try {
        await onDeleteProduct(id);
        onShowToast('Товар удален', 'success');
      } catch (err) {
        onShowToast('Ошибка при удалении', 'error');
      }
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить статью "${title}"?`)) {
      try {
        await onDeleteBlogPost(id);
        onShowToast('Статья удалена', 'success');
      } catch (e) {
        onShowToast('Ошибка при удалении', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-panel-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div
        id="admin-panel-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shadow-md">
              <span className="material-icons text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="font-black uppercase tracking-tight text-white text-base sm:text-lg">
                Панель управления (Admin)
              </h2>
              <p className="text-xs uppercase font-bold tracking-widest text-white/50">
                Управление каталогом и ассортиментом
              </p>
            </div>
          </div>

          <button
            id="admin-panel-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10 bg-[#161616] px-4 sm:px-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <button
            id="admin-tab-list-btn"
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'list'
                ? 'border-[#7c3aed] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-icons text-base">inventory_2</span>
            Список товаров ({products.length})
          </button>
          <button
            id="admin-tab-add-btn"
            type="button"
            onClick={openCreateForm}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'edit'
                ? 'border-[#7c3aed] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-icons text-base">
              {editingId ? 'edit' : 'add_circle'}
            </span>
            {editingId ? 'Редактирование' : 'Добавить товар'}
          </button>
          <button
            id="admin-tab-blogs-btn"
            type="button"
            onClick={() => setActiveTab('blogs')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'blogs'
                ? 'border-[#7c3aed] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-icons text-base">article</span>
            Блоги ({blogPosts?.length || 0})
          </button>
          <button
            id="admin-tab-orders-btn"
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#7c3aed] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-icons text-base">receipt_long</span>
            Заказы
          </button>
          <button
            id="admin-tab-settings-btn"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#7c3aed] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-icons text-base">settings</span>
            Настройки
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-neutral-400">
                  Всего товаров в базе: {products.length}
                </span>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="py-1.5 px-3 rounded-lg bg-[#7c3aed] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#6d28d9] transition-all cursor-pointer"
                >
                  <span className="material-icons text-sm">add</span> Новый товар
                </button>
              </div>

              <div className="divide-y divide-[#222222] border border-[#262626] rounded-xl overflow-hidden bg-[#141414]">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-neutral-400">
                    Товаров нет. Нажмите «Добавить товар».
                  </div>
                ) : (
                  products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-[#222] border border-[#333] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-xs sm:text-sm truncate">
                            {p.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                          <span className="text-purple-400 font-medium">
                            {p.category}
                          </span>
                          <span>•</span>
                          <span>Город: {p.city}</span>
                          <span>•</span>
                          <span className="font-bold text-white">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditForm(p)}
                          className="p-2 rounded-lg bg-[#222222] hover:bg-[#7c3aed] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="Редактировать"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-lg bg-[#222222] hover:bg-red-600 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <span className="material-icons text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'edit' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Название товара *
                </label>
                <input
                  id="admin-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="например: Жидкость Husky White Salt 30ml"
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              {/* Category & City & Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Категория *
                  </label>
                  <select
                    id="admin-select-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="Жидкости">Жидкости</option>
                    <option value="POD-системы">POD-системы</option>
                    <option value="Испарители">Испарители</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Город наличия *
                  </label>
                  <select
                    id="admin-select-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value as ProductCity)}
                    className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="Ивье">Ивье</option>
                    <option value="Лида">Лида</option>
                    <option value="Оба">Оба (Ивье и Лида)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Базовая цена (BYN) *
                  </label>
                  <input
                    id="admin-input-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Фотография товара (Загрузка файла или URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#111] border border-[#333] shrink-0">
                    <img
                      src={imageUrl || 'https://via.placeholder.com/150'}
                      alt="Превью"
                      className="w-full h-full object-cover"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="material-icons text-sm text-[#7c3aed] animate-spin">refresh</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#282828] file:text-neutral-200 hover:file:bg-[#333] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Или укажите прямую ссылку на фото https://..."
                      className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                </div>
              </div>

              {/* Variants Textarea */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Варианты (каждый с новой строки в формате: "Название Цена")
                </label>
                <p className="text-[11px] text-neutral-500 mb-1.5">
                  Пример: "Клубника 3мг 30мл 25.50" или "Black 68.00"
                </p>
                <textarea
                  id="admin-textarea-variants"
                  rows={3}
                  value={variantsText}
                  onChange={(e) => setVariantsText(e.target.value)}
                  placeholder="Вариант 1 25.00&#10;Вариант 2 26.50"
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              {/* Category-Specific Characteristics */}
              <div className="bg-[#121212] p-3.5 rounded-xl border border-[#222222] space-y-3">
                <h5 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <span className="material-icons text-sm text-[#7c3aed]">settings</span>
                  Характеристики ({category})
                </h5>

                {category === 'Жидкости' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Соотношение PG/VG (необязательно)
                      </label>
                      <input
                        type="text"
                        value={pgVg}
                        onChange={(e) => setPgVg(e.target.value)}
                        placeholder="50/50 или 70/30"
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Крепость никотина
                      </label>
                      <input
                        type="text"
                        value={nicotine}
                        onChange={(e) => setNicotine(e.target.value)}
                        placeholder="20 мг солевой"
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Объем флакона
                      </label>
                      <input
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        placeholder="30 мл"
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Мощность (Вт)
                      </label>
                      <input
                        type="text"
                        value={power}
                        onChange={(e) => setPower(e.target.value)}
                        placeholder="До 30 Вт"
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Сопротивление (Ом)
                      </label>
                      <input
                        type="text"
                        value={resistance}
                        onChange={(e) => setResistance(e.target.value)}
                        placeholder="0.6 / 0.8 / 1.2 Ом"
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Объем бака / АКБ
                      </label>
                      <input
                        type="text"
                        value={tankVolume}
                        onChange={(e) => setTankVolume(e.target.value)}
                        placeholder="2.0 мл / 1000 мАч"
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="py-2.5 px-4 rounded-xl border border-[#333] hover:bg-[#252525] text-neutral-300 text-xs font-medium cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  id="admin-save-product-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#7c3aed]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="material-icons animate-spin text-lg">refresh</span>
                  ) : (
                    <span className="material-icons text-lg">save</span>
                  )}
                  {editingId ? 'Сохранить изменения' : 'Добавить в базу'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4 border-b border-white/10 pb-2">История заказов</h3>
              {isLoadingOrders ? (
                <div className="flex justify-center p-8 text-[#7c3aed]">
                  <span className="material-icons animate-spin text-3xl">refresh</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center p-8 text-white/40">
                  <span className="material-icons text-4xl mb-2">inbox</span>
                  <p>Нет заказов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-[#131313] border border-white/5 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start border-b border-white/5 pb-3">
                        <div>
                          <span className="text-white font-black tracking-tight text-lg uppercase block">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(order.createdAt).toLocaleString()} • {order.city}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="bg-[#262626] border border-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-[#7c3aed]"
                          >
                            <option value="new">Новый</option>
                            <option value="completed">Выполнен</option>
                            <option value="cancelled">Отменен</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">{item.quantity}x</span>
                              <span className="text-white">{item.name} <span className="text-[#7c3aed] text-xs">({item.variant.name})</span></span>
                            </div>
                            <span className="text-white font-bold">{formatPrice(item.variant.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2 border-t border-white/5">
                        <span className="text-[#7c3aed] font-black uppercase tracking-tight">Итого: {formatPrice(order.totalSum)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 border-b border-white/10 pb-2">Общие настройки</h3>
              
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                    Telegram Юзернейм (без @)
                  </label>
                  <div className="flex">
                    <span className="bg-[#262626] border border-white/10 border-r-0 text-white/50 px-3 py-2.5 rounded-l-xl text-sm flex items-center">
                      @
                    </span>
                    <input
                      type="text"
                      value={localTelegram}
                      onChange={(e) => setLocalTelegram(e.target.value.replace('@', ''))}
                      className="flex-1 bg-[#161616] border border-white/10 rounded-r-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                      placeholder="ISTERTELEGRAM"
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1.5">
                    Куда будут отправляться заказы из корзины.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full py-3 px-6 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#7c3aed]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <span className="material-icons animate-spin text-lg">refresh</span>
                  ) : (
                    <span className="material-icons text-lg">save</span>
                  )}
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-neutral-400">
                  Всего статей: {blogPosts.length}
                </span>
                <button
                  type="button"
                  onClick={openCreateBlogForm}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Новая статья
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blogPosts.map((post) => (
                  <div key={post.id} className="bg-[#131313] border border-white/5 rounded-xl p-3 flex gap-4 items-center">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-20 h-20 object-cover rounded-lg bg-[#262626] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate text-sm">{post.title}</h4>
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">{post.excerpt}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => openEditBlogForm(post)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-1.5 rounded-md transition-colors"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(post.id, post.title)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-1.5 rounded-md transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'edit-blog' && (
            <form onSubmit={handleSubmitBlog} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                  Название статьи *
                </label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                  Краткое описание
                </label>
                <textarea
                  rows={2}
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                  Содержание (можно HTML) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                    Ссылка на картинку
                  </label>
                  <input
                    type="url"
                    value={blogImageUrl}
                    onChange={(e) => setBlogImageUrl(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                    Время чтения
                  </label>
                  <input
                    type="text"
                    value={blogReadTime}
                    onChange={(e) => setBlogReadTime(e.target.value)}
                    placeholder="5 мин"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('blogs')}
                  className="flex-1 py-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Сохранение...' : (editingBlogId ? 'Сохранить изменения' : 'Добавить статью')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
