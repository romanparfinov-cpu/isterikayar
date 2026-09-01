import React, { useState } from 'react';
import { City, ActiveTab, AppUser } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  currentCity: City;
  cartCount: number;
  user: AppUser | null;
  onTabChange: (tab: ActiveTab) => void;
  onRequestCityChange: (newCity: City) => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onLoginGoogle: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentCity,
  cartCount,
  user,
  onTabChange,
  onRequestCityChange,
  onOpenCart,
  onOpenAdmin,
  onLoginGoogle,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { label: ActiveTab; icon: string }[] = [
    { label: 'Главная', icon: 'home' },
    { label: 'Жидкости', icon: 'water_drop' },
    { label: 'POD-системы', icon: 'smartphone' },
    { label: 'Испарители', icon: 'autorenew' },
    { label: 'Блог', icon: 'article' },
  ];

  const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value as City;
    if (newCity !== currentCity) {
      onRequestCityChange(newCity);
    }
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/10 shrink-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Left: Logo and Nav */}
          <div className="flex items-center gap-3 lg:gap-10">
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium uppercase tracking-widest">
              {navItems.map((item) => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    id={`nav-link-${item.label}`}
                    type="button"
                    onClick={() => onTabChange(item.label)}
                    className={`transition-colors cursor-pointer text-xs lg:text-sm font-bold uppercase tracking-widest ${
                      isActive
                        ? 'text-white border-b-2 border-[#7c3aed] pb-1'
                        : 'text-white/60 hover:text-[#7c3aed]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: City Select, Cart, Auth, Admin */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* City Selector */}
            <div className="relative group shrink-0">
              <select
                id="header-city-select"
                value={currentCity}
                onChange={handleCitySelectChange}
                className="bg-[#1a1a1a] border border-white/20 rounded-md sm:rounded-lg px-1.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-sm font-bold uppercase tracking-wider text-white outline-none cursor-pointer hover:border-[#7c3aed] transition-colors appearance-none pr-5 sm:pr-8"
              >
                <option value="Ивье" className="bg-[#1a1a1a] text-white">г. Ивье</option>
                <option value="Лида" className="bg-[#1a1a1a] text-white">г. Лида</option>
              </select>
              <span className="material-icons text-[14px] sm:text-xs text-white/50 absolute right-0.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Admin Panel Button (if admin logged in) */}
            {user?.isAdmin && (
              <button
                id="header-admin-btn"
                type="button"
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed] hover:bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
                title="Панель администратора"
              >
                <span className="material-icons text-sm">admin_panel_settings</span>
                <span>Админ</span>
              </button>
            )}

            {/* Google Auth / Profile */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  id="header-user-avatar-btn"
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#7c3aed] transition-colors cursor-pointer"
                >
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                  />
                  <span className="material-icons text-[10px] sm:text-xs text-white/50 hidden sm:block">
                    expand_more
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    id="header-user-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-[#181818] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in"
                  >
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">
                        {user.displayName || 'Пользователь'}
                      </p>
                      <p className="text-[11px] text-white/50 truncate">
                        {user.email}
                      </p>
                      {user.isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#7c3aed] text-white text-[10px] font-black uppercase tracking-wider">
                          Администратор
                        </span>
                      )}
                    </div>

                    {user.isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full mt-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-[#7c3aed]/20 transition-colors text-left"
                      >
                        <span className="material-icons text-sm">admin_panel_settings</span>
                        Управление
                      </button>
                    )}

                    <button
                      id="header-logout-btn"
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full mt-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/30 transition-colors text-left"
                    >
                      <span className="material-icons text-sm">logout</span>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-google-login-btn"
                type="button"
                onClick={onLoginGoogle}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#7c3aed] px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shrink-0"
              >
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.39 7.37 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}

            {/* Cart Button */}
            <div className="relative shrink-0">
              <button
                id="header-cart-btn"
                type="button"
                onClick={onOpenCart}
                className="p-1 sm:p-2 hover:bg-white/10 rounded-full relative flex items-center justify-center cursor-pointer transition-colors text-white"
                title="Корзина"
              >
                <span className="material-icons text-xl sm:text-2xl">
                  shopping_cart
                </span>
                {cartCount > 0 && (
                  <span
                    id="header-cart-badge"
                    className="absolute top-0 right-0 bg-[#7c3aed] text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full font-bold shadow-md shadow-[#7c3aed]/50 animate-in zoom-in"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="header-mobile-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 sm:p-2 rounded-md bg-white/5 border border-white/10 text-neutral-300 hover:text-white shrink-0 ml-0.5"
            >
              <span className="material-icons text-lg sm:text-xl leading-none block">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="header-mobile-nav"
            className="md:hidden py-4 border-t border-white/10 space-y-1 animate-in fade-in"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onTabChange(item.label);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-left transition-colors ${
                    isActive
                      ? 'bg-[#7c3aed] text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-icons text-lg">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            {user?.isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-purple-300 bg-purple-950/40 border border-purple-800/40 text-left mt-2"
              >
                <span className="material-icons text-lg">admin_panel_settings</span>
                Управление товарами (Админ)
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

