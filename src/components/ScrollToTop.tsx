import React, { useState, useEffect } from 'react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      id="scroll-to-top-btn"
      type="button"
      onClick={scrollToTop}
      title="Наверх"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 bg-[#7c3aed] p-3 sm:p-3.5 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer text-white flex items-center justify-center animate-in fade-in"
    >
      <span className="material-icons text-2xl">arrow_upward</span>
    </button>
  );
};
