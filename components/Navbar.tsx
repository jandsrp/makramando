
import React, { useState } from 'react';
import { View } from '../types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface NavbarProps {
  currentView: View;
  navigateTo: (view: View) => void;
  cartCount: number;
  session: Session | null;
  profile?: any | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, navigateTo, cartCount, session, profile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigateTo('home');
  };

  const navItems: { label: string; view: View }[] = [
    { label: 'Início', view: 'home' },
    { label: 'Loja', view: 'shop' },
    { label: 'Sobre', view: 'about' },
    { label: 'Contato', view: 'contact' },
  ];

  if (profile?.role === 'admin' || profile?.role === 'master_admin') {
    navItems.push({ label: 'Admin', view: 'admin' });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between h-20">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigateTo('home')}
        >
          <img src="/assets/logo-header-new.png" alt="Makramando" className="h-16 object-contain" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-9">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigateTo(item.view)}
              className={`text-sm font-medium transition-colors hover:text-primary ${currentView === item.view ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session && (
            <>
              <button
                onClick={() => navigateTo('account')}
                className="flex items-center justify-center size-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 transition-colors"
                title="Minha Conta"
              >
                <span className="material-symbols-outlined text-xl">person</span>
              </button>
              {(profile?.role === 'admin' || profile?.role === 'master_admin') && (
                <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-black uppercase rounded-full border border-primary/30">
                  {profile?.role === 'master_admin' ? 'Master' : 'Admin'}
                </span>
              )}
            </>
          )}
          <button
            onClick={() => navigateTo('cart')}
            className="flex items-center justify-center size-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-surface-dark">
                {cartCount}
              </span>
            )}
          </button>

          {session ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center size-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo('auth')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Entrar
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-700 dark:text-gray-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                navigateTo(item.view);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-3 rounded-lg font-medium ${currentView === item.view ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => { navigateTo('account'); setMobileMenuOpen(false); }}
              className={`text-left px-4 py-3 rounded-lg font-medium ${currentView === 'account' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Minha Conta
            </button>
            <button
              onClick={() => { navigateTo('cart'); setMobileMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-bold"
            >
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
              Carrinho ({cartCount})
            </button>
          </div>

          {/* Mobile Auth Button */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            {session ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold dark:bg-red-900/20"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sair
              </button>
            ) : (
              <button
                onClick={() => { navigateTo('auth'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Entrar
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
