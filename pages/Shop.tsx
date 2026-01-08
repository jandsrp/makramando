
import React, { useState, useMemo } from 'react';
import { Product, View } from '../types';
import { Reveal } from '../components/UI/Reveal';

interface ShopProps {
  products: Product[];
  navigateTo: (view: View, id?: string) => void;
}

const Shop: React.FC<ShopProps> = ({ products, navigateTo }) => {
  const [activeCategory, setActiveCategory] = useState('Todas');
  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todas') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="flex flex-col gap-8">
        <Reveal>
          <div>
            <h1 className="text-4xl font-black tracking-tight dark:text-white">Nossa Loja</h1>
            <p className="text-gray-500 mt-2">Explore nossa coleção artesanal de decoração em macramê.</p>
          </div>
        </Reveal>

        {/* Filter Bar */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeCategory === cat
                  ? 'bg-primary text-black shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p, index) => (
            <Reveal key={p.id} delay={0.2 + (index % 4) * 0.1}>
              <div
                onClick={() => navigateTo('product', p.id)}
                className="group flex flex-col bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={p.image_url || ''}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.is_bestseller && (
                    <span className="absolute top-4 left-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">BESTSELLER</span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow" style={{ minHeight: '140px' }}>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{p.category}</span>
                  <h3 className="text-lg font-bold dark:text-white mt-1">{p.name}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-primary">R$ {p.price.toFixed(2)}</span>
                    <button className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <span className="material-symbols-outlined text-gray-500 group-hover:text-black transition-colors">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
            <p className="text-gray-500 text-lg">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
