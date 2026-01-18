import React from 'react';
import { CartItem, View } from '../types';
import { supabase } from '../services/supabase';
import { Reveal } from '../components/UI/Reveal';
import emailjs from '@emailjs/browser';

// EmailJS Configuration (same as Contact.tsx)
const EMAILJS_SERVICE_ID = 'service_s8aaw2a';
const EMAILJS_TEMPLATE_ID = 'template_eoje73s';
const EMAILJS_PUBLIC_KEY = 'Jqp8DnRa2g0xaUxCX';

interface CheckoutProps {
  cart: CartItem[];
  navigateTo: (view: View) => void;
  clearCart: () => void | Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, navigateTo, clearCart, showToast }) => {
  const [loading, setLoading] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Check authentication on mount and fetch user profile
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session) {
        showToast('Você precisa estar logado para finalizar a compra.', 'info');
        navigateTo('auth');
      } else {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigateTo]);

  const formatOrderItemsForEmail = (items: CartItem[]) => {
    return items.map(item =>
      `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
  };

  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        showToast('Por favor, faça login para enviar o pedido.', 'info');
        navigateTo('auth');
        return;
      }

      // 1. Create order with status 'em_analise'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: total,
          status: 'em_analise'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
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

      // 3. Send email notification via EmailJS
      const orderItemsText = formatOrderItemsForEmail(cart);
      const orderDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            name: userProfile?.full_name || session.user.email,
            email: session.user.email,
            phone: userProfile?.phone || 'Não informado',
            title: `Novo Pedido #${order.id.slice(0, 8)}`,
            message: `
📦 NOVO PEDIDO RECEBIDO

👤 DADOS DO CLIENTE:
Nome: ${userProfile?.full_name || 'Não informado'}
Email: ${session.user.email}
Telefone: ${userProfile?.phone || 'Não informado'}

🛒 ITENS DO PEDIDO:
${orderItemsText}

💰 TOTAL: R$ ${total.toFixed(2)}

📅 Data: ${orderDate}
🔖 ID do Pedido: #${order.id.slice(0, 8)}
📊 Status: Em Análise

---
Este pedido foi enviado automaticamente pelo site Makramando.
            `.trim()
          },
          EMAILJS_PUBLIC_KEY
        );
        console.log('Email de pedido enviado com sucesso!');
      } catch (emailErr) {
        console.error('Erro ao enviar email do pedido:', emailErr);
        // Continue mesmo se o email falhar - o pedido foi salvo
      }

      showToast('Pedido enviado com sucesso! Entraremos em contato em breve.', 'success');
      await clearCart();
      navigateTo('home');
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Erro ao processar o seu pedido.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

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
              Finalize seu pedido e leve a arte do macramê para sua casa. Finalize seu pedido, entraremos em contato, ou se preferir nos chame pelo Whatsapp.
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
            onClick={handleSendOrder}
            disabled={loading || cart.length === 0}
            className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl mt-6 shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">send</span>
            {loading ? 'Enviando...' : 'Enviar Pedido'}
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

