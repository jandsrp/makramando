import React from 'react';
import { CartItem, View } from '../types';
import { supabase } from '../services/supabase';
import { Reveal } from '../components/UI/Reveal';

interface CheckoutProps {
  cart: CartItem[];
  navigateTo: (view: View) => void;
  clearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, navigateTo, clearCart }) => {
  const [loading, setLoading] = React.useState(false);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleConfirmPayment = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Por favor, faça login para finalizar a compra.');
        navigateTo('auth');
        return;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert('Pedido realizado com sucesso!');
      clearCart();
      navigateTo('home');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao processar o seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-8">
      <Reveal width="fit-content">
        <div className="flex flex-col items-center gap-8">
          <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-bounce">
            <span className="material-symbols-outlined text-5xl">task_alt</span>
          </div>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-black tracking-tight dark:text-white">Quase lá!</h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto">
              Finalize seu pedido e leve a arte do macramê para sua casa.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} width="fit-content">
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl w-full max-w-md">
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
            onClick={handleConfirmPayment}
            disabled={loading || cart.length === 0}
            className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl mt-6 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Confirmar Pagamento'}
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.2} width="fit-content">
        <button
          onClick={() => navigateTo('cart')}
          className="text-gray-500 hover:text-primary font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar para o carrinho
        </button>
      </Reveal>
    </div>
  );
};

export default Checkout;
