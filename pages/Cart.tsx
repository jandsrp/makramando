
import React from 'react';
import { CartItem, View } from '../types';

interface CartProps {
  cart: CartItem[];
  removeFromCart: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, delta: number, color?: string, size?: string) => void;
  navigateTo: (view: View) => void;
}

const Cart: React.FC<CartProps> = ({ cart, removeFromCart, updateQuantity, navigateTo }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-6">
        <div className="size-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
          <span className="material-symbols-outlined text-4xl">shopping_cart</span>
        </div>
        <h2 className="text-3xl font-black dark:text-white">Seu carrinho está vazio</h2>
        <p className="text-gray-500 max-w-sm">Parece que você ainda não escolheu suas peças favoritas. Que tal dar uma olhada na nossa coleção?</p>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-primary hover:bg-primary-dark text-black font-bold py-4 px-10 rounded-xl shadow-lg"
        >
          Ir para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight dark:text-white">Seu Carrinho</h1>
          <p className="text-gray-500 mt-2">{cart.length} item(s) selecionados</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                className="flex flex-col sm:flex-row gap-6 p-6 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="size-24 sm:size-32 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold dark:text-white">{item.name}</h3>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                        {item.color && (
                          <span className="flex items-center gap-1 uppercase tracking-widest">
                            Cor: <span className="size-3 rounded-full border border-gray-200" style={{ backgroundColor: item.color }}></span>
                          </span>
                        )}
                        {item.size && <span>Tamanho: {item.size}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="size-8 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="px-4 font-bold text-sm dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="size-8 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <span className="text-xl font-black text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:col-span-4">
            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-28">
              <h2 className="text-2xl font-bold dark:text-white mb-6">Resumo</h2>
              <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-bold dark:text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Frete</span>
                  <span className="text-primary font-bold">Grátis</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-lg font-bold dark:text-white">Total</span>
                <span className="text-3xl font-black text-primary">R$ {subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigateTo('checkout')}
                className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl mt-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Finalizar Compra
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
