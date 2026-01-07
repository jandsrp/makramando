
import React from 'react';
import { View } from '../types';

interface FooterProps {
  navigateTo: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="flex items-center gap-2 text-text dark:text-white">
            <img src="/assets/logo-icon.png" alt="Makramando" className="size-8 object-contain" />
            <span className="text-lg font-bold">Makramando</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Arte em nós, feita com amor.</p>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <button onClick={() => navigateTo('shop')} className="hover:text-primary transition-colors">Loja</button>
          <button onClick={() => navigateTo('about')} className="hover:text-primary transition-colors">Sobre</button>
          <button onClick={() => navigateTo('contact')} className="hover:text-primary transition-colors">Contato</button>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-600">© 2024 Macramê Store. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
