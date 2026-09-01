import React, { useState, useEffect, useMemo } from 'react';
import { 
  City, 
  ActiveTab, 
  Product, 
  ProductVariant, 
  CartItem, 
  BlogPost, 
  ToastMessage, 
  AppUser 
} from './types';
import { 
  fetchProducts, 
  fetchSettings,
  fetchBlogPosts,
  addProductToDB, 
  updateProductInDB, 
  deleteProductFromDB, 
  addBlogPostToDB,
  updateBlogPostInDB,
  deleteBlogPostFromDB,
  loginWithGoogle, 
  logoutUser, 
  subscribeToAuthState,
  getLocalProducts
} from './services/firebase';

import { Header } from './components/Header';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { CityChangeModal } from './components/CityChangeModal';
import { CategoryQuickNav } from './components/CategoryQuickNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { TelegramOrderModal } from './components/TelegramOrderModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { BlogSection } from './components/BlogSection';
import { ToastContainer } from './components/ToastContainer';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';

const CART_STORAGE_KEY = 'isterika_cart_items';
const CITY_STORAGE_KEY = 'isterika_selected_city';
const AGE_STORAGE_KEY = 'isterika_age_verified';

export default function App() {
  // Age Verification
  const [ageVerified, setAgeVerified] = useState<boolean>(() => {
    return localStorage.getItem(AGE_STORAGE_KEY) === 'true';
  });

  // Current City
  const [currentCity, setCurrentCity] = useState<City>(() => {
    const saved = localStorage.getItem(CITY_STORAGE_KEY);
    return saved === 'Лида' ? 'Лида' : 'Ивье';
  });
  const [pendingCity, setPendingCity] = useState<City | null>(null);

  // Navigation & Category Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('Главная');

  // Products and Blog
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [telegramUsername, setTelegramUsername] = useState<string>('ISTERTELEGRAM');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [telegramOrderModal, setTelegramOrderModal] = useState<{
    isOpen: boolean;
    orderNumber: string;
  }>({
    isOpen: false,
    orderNumber: '',
  });

  // User auth
  const [user, setUser] = useState<AppUser | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Helper to add toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Data Load & Auth Subscription
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        
        // Timeout wrapper to prevent infinite loading if Firebase hangs
        const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
          return new Promise((resolve) => {
            const timer = setTimeout(() => resolve(fallback), ms);
            promise.then((res) => {
              clearTimeout(timer);
              resolve(res);
            }).catch((err) => {
              clearTimeout(timer);
              console.error(err);
              resolve(fallback);
            });
          });
        };

        const [data, settings, blogs] = await Promise.all([
          withTimeout(fetchProducts(), 5000, []),
          withTimeout(fetchSettings(), 5000, { telegramUsername: 'ISTERTELEGRAM' }),
          withTimeout(fetchBlogPosts(), 5000, [])
        ]);

        if (isMounted) {
          // If fallback was triggered and returned empty, we can try to load from localStorage directly
          setProducts(data.length ? data : getLocalProducts());
          setBlogPosts(blogs);
          if (settings && settings.telegramUsername) {
            setTelegramUsername(settings.telegramUsername);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        showToast('Не удалось загрузить данные', 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    const unsubscribe = subscribeToAuthState((appUser) => {
      if (isMounted) setUser(appUser);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cartItems]);

  // 3. Persist City
  useEffect(() => {
    localStorage.setItem(CITY_STORAGE_KEY, currentCity);
  }, [currentCity]);

  // Age Verification Handlers
  const handleAgeConfirm = () => {
    localStorage.setItem(AGE_STORAGE_KEY, 'true');
    setAgeVerified(true);
    showToast('Добро пожаловать в ISTERIKA!', 'success');
  };

  const handleAgeReject = () => {
    window.location.href = 'about:blank';
  };

  // City Switch Logic with confirmation modal
  const handleRequestCityChange = (newCity: City) => {
    if (newCity === currentCity) return;

    if (cartItems.length > 0) {
      // Show warning modal
      setPendingCity(newCity);
    } else {
      // Directly switch if cart is empty
      setCurrentCity(newCity);
      showToast(`Город изменен на ${newCity}`, 'info');
    }
  };

  const handleConfirmCityChange = () => {
    if (pendingCity) {
      setCartItems([]);
      setCurrentCity(pendingCity);
      showToast(`Город изменен на ${pendingCity}. Корзина очищена.`, 'info');
      setPendingCity(null);
    }
  };

  const handleCancelCityChange = () => {
    setPendingCity(null);
  };

  // Cart Management
  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    const itemId = `${product.id}-${variant.name}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          name: product.name,
          category: product.category,
          variant,
          quantity: 1,
          imageUrl: product.imageUrl,
        };
        return [...prev, newItem];
      }
    });

    // Close product modal if open
    setSelectedProductDetail(null);

    // Show brief success toast
    showToast(`«${product.name}» (${variant.name}) добавлен в корзину!`, 'success');
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Корзина очищена', 'info');
  };

  const handleOrderCompleted = (orderNumber: string) => {
    setIsCartOpen(false);
    setTelegramOrderModal({
      isOpen: true,
      orderNumber,
    });
  };

  const handleCloseTelegramOrderModal = () => {
    setTelegramOrderModal({ isOpen: false, orderNumber: '' });
    setCartItems([]);
  };

  // Admin CRUD
  const handleSaveProduct = async (productData: Omit<Product, 'id'>, id?: string) => {
    if (id) {
      const updatedProduct: Product = { ...productData, id };
      await updateProductInDB(updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
    } else {
      const added = await addProductToDB(productData);
      setProducts((prev) => [added, ...prev]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromDB(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveBlogPost = async (postData: Omit<BlogPost, 'id'>, id?: string) => {
    if (id) {
      const updatedPost: BlogPost = { ...postData, id };
      await updateBlogPostInDB(id, updatedPost);
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));
    } else {
      const added = await addBlogPostToDB(postData);
      setBlogPosts((prev) => [added, ...prev]);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    await deleteBlogPostFromDB(id);
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Auth
  const handleLoginGoogle = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      if (loggedUser.isAdmin) {
        showToast(`Вы вошли как администратор (${loggedUser.displayName || 'Admin'})!`, 'success');
      } else {
        showToast(`Добро пожаловать, ${loggedUser.displayName || 'Пользователь'}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        showToast('Окно входа заблокировано браузером. Разрешите всплывающие окна.', 'error');
        return;
      }
      showToast('Ошибка входа через Google', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      showToast('Вы вышли из системы', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Products for selected city and active tab
  const cityProducts = useMemo(() => {
    return products.filter((p) => p.city === currentCity || p.city === 'Оба');
  }, [products, currentCity]);

  const displayedProducts = useMemo(() => {
    if (activeTab === 'Главная') {
      return cityProducts;
    }
    if (activeTab === 'Жидкости' || activeTab === 'POD-системы' || activeTab === 'Испарители') {
      return cityProducts.filter((p) => p.category === activeTab);
    }
    return [];
  }, [cityProducts, activeTab]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col selection:bg-[#7c3aed] selection:text-white">
      {/* 18+ Age Verification Modal */}
      <AgeVerificationModal
        isOpen={!ageVerified}
        onConfirm={handleAgeConfirm}
        onReject={handleAgeReject}
      />

      {/* City Change Warning Modal */}
      <CityChangeModal
        isOpen={!!pendingCity}
        targetCity={pendingCity}
        onConfirm={handleConfirmCityChange}
        onCancel={handleCancelCityChange}
      />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        currentCity={currentCity}
        cartCount={totalCartCount}
        user={user}
        onTabChange={(tab) => setActiveTab(tab)}
        onRequestCityChange={handleRequestCityChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLoginGoogle={handleLoginGoogle}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-[#222] border-t-[#7c3aed] rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-400 font-medium">Загрузка каталога ISTERIKA...</p>
          </div>
        ) : (
          <>
            {/* View: Blog */}
            {activeTab === 'Блог' ? (
              <BlogSection posts={blogPosts} />
            ) : (
              <div>
                {/* Home Page Category Navigation Tiles (only on Главная) */}
                {activeTab === 'Главная' && (
                  <CategoryQuickNav
                    selectedCategory={null}
                    onSelectCategory={(cat) => {
                      if (cat) setActiveTab(cat);
                    }}
                  />
                )}

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white">
                      {activeTab === 'Главная' ? (
                        <>
                          Популярное в <span className="text-[#7c3aed] underline underline-offset-4 decoration-2">{currentCity}</span>
                        </>
                      ) : (
                        <>
                          {activeTab} в <span className="text-[#7c3aed] underline underline-offset-4 decoration-2">{currentCity}</span>
                        </>
                      )}
                    </h1>
                    <span className="text-white/40 text-xs uppercase tracking-widest font-bold mt-2 block">
                      {displayedProducts.length > 0
                        ? `Показано ${displayedProducts.length} товаров в наличии`
                        : 'В выбранном городе позиции не найдены'}
                    </span>
                  </div>

                  {activeTab !== 'Главная' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('Главная')}
                      className="text-xs uppercase font-bold tracking-widest text-[#7c3aed] hover:text-[#9061f9] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span className="material-icons text-sm">arrow_back</span>
                      Все категории
                    </button>
                  )}
                </div>

                {/* Products Grid */}
                {displayedProducts.length === 0 ? (
                  <div
                    id="empty-products-placeholder"
                    className="p-12 sm:p-16 text-center bg-[#141414] border border-[#222] rounded-2xl space-y-3"
                  >
                    <span className="material-icons text-5xl text-neutral-600">
                      inventory_2
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Товаров пока нет, загляните позже
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                      В категории «{activeTab}» для города {currentCity} товары временно закончились или ожидается новая поставка.
                    </p>
                  </div>
                ) : (
                  <div
                    id="products-grid"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6"
                  >
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpenDetail={(p) => setSelectedProductDetail(p)}
                        onQuickAdd={(p, v) => handleAddToCart(p, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        city={currentCity}
        cartItems={cartItems}
        telegramUsername={telegramUsername}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Telegram Order Sent Modal */}
      <TelegramOrderModal
        isOpen={telegramOrderModal.isOpen}
        orderNumber={telegramOrderModal.orderNumber}
        onClose={handleCloseTelegramOrderModal}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        products={products}
        blogPosts={blogPosts}
        telegramUsername={telegramUsername}
        onClose={() => setIsAdminOpen(false)}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onSaveBlogPost={handleSaveBlogPost}
        onDeleteBlogPost={handleDeleteBlogPost}
        onSettingsChange={setTelegramUsername}
        onShowToast={showToast}
      />

      {/* Bottom Right Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Scroll to top button (> 300px) */}
      <ScrollToTop />

      {/* Footer */}
      <Footer onShowToast={showToast} telegramUsername={telegramUsername} />
    </div>
  );
}
