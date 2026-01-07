
import React from 'react';
import { Product, View } from '../types';

import { HeroSlider } from '../components/UI/HeroSlider';

interface HomeProps {
  products: Product[];
  navigateTo: (view: View, id?: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, navigateTo }) => {
  const featured = products.slice(0, 3); // Or filter by is_bestseller?

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSlider onCtaClick={() => navigateTo('shop')} />

      {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight dark:text-white">Destaques da Temporada</h2>
            <p className="text-gray-500 mt-2">Peças exclusivas tecidas à mão por nossos artesãos.</p>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-primary font-bold hover:underline"
          >
            Ver tudo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((p) => (
            <div
              key={p.id}
              onClick={() => navigateTo('product', p.id)}
              className="group cursor-pointer bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={p.image_url || ''}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.is_new && (
                  <span className="absolute top-4 left-4 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">NOVO</span>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold dark:text-white">{p.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-1">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">R$ {p.price.toFixed(2)}</span>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">add_shopping_cart</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote / Value Prop */}
      <section className="bg-primary/5 dark:bg-primary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">favorite</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight dark:text-white">Cada nó conta uma história</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 italic">
            "Na Macramê Store, acreditamos que a decoração deve ter alma. Cada peça é feita 100% à mão com algodão orgânico, transformando ambientes frios em lares acolhedores."
          </p>
          <button
            onClick={() => navigateTo('about')}
            className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary-dark transition-colors"
          >
            Saiba mais sobre nós
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
