
import React from 'react';
import { CartItem, View } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  navigateTo: (view: View) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, navigateTo }) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-8">
      <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-bounce">
         <span className="material-symbols-outlined text-5xl">task_alt</span>
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight dark:text-white">Quase lá!</h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto">
          Esta é uma demonstração de checkout. No ambiente real, aqui você escolheria a forma de pagamento e confirmaria o endereço.
        </p>
      </div>

      <div className="w-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl max-w-md">
         <h2 className="text-xl font-bold mb-4 dark:text-white">Resumo do Pedido</h2>
         <div className="flex flex-col gap-2 mb-6">
            {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
         </div>
         <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="font-bold dark:text-white">Total a pagar:</span>
            <span className="text-2xl font-black text-primary">R$ {total.toFixed(2)}</span>
         </div>
         <button 
           onClick={() => { alert('Obrigado pela compra (Demonstração)!'); navigateTo('home'); }}
           className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl mt-6 shadow-lg shadow-primary/20"
         >
           Confirmar Pagamento
         </button>
      </div>
      
      <button 
        onClick={() => navigateTo('cart')}
        className="text-gray-500 hover:text-primary font-bold flex items-center gap-2"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Voltar para o carrinho
      </button>
    </div>
  );
};

export default Checkout;
