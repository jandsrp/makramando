
import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { View, Order } from '../types';
import { supabase } from '../services/supabase';
import { Reveal } from '../components/UI/Reveal';

interface AccountProps {
    session: Session | null;
    navigateTo: (view: View) => void;
}

const Account: React.FC<AccountProps> = ({ session, navigateTo }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            navigateTo('auth');
            return;
        }

        const fetchData = async () => {
            setLoading(true);

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setProfile(profileData);

            // Fetch Orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            setOrders(ordersData || []);

            setLoading(false);
        };

        fetchData();
    }, [session, navigateTo]);

    if (!session) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col gap-8">
                <Reveal>
                    <div>
                        <h1 className="text-4xl font-black dark:text-white">Minha Conta</h1>
                        <p className="text-gray-500 mt-2">Bem-vindo de volta, {profile?.full_name || session.user.email}.</p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Reveal delay={0.1}>
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 dark:text-white">Seus Dados</h2>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Nome</span>
                                        <p className="text-sm font-medium dark:text-white">{profile?.full_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                                        <p className="text-sm font-medium dark:text-white">{session.user.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Tipo de Conta</span>
                                        <p className="text-sm font-medium text-primary capitalize">{profile?.role || 'Cliente'}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {profile?.role === 'admin' && (
                            <Reveal delay={0.2}>
                                <button
                                    onClick={() => navigateTo('admin')}
                                    className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">dashboard</span>
                                    Painel Admin
                                </button>
                            </Reveal>
                        )}
                    </div>

                    {/* Orders List */}
                    <div className="md:col-span-2">
                        <Reveal delay={0.3}>
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h2 className="text-lg font-bold mb-6 dark:text-white">Histórico de Pedidos</h2>

                                {loading ? (
                                    <p className="text-center py-10 text-gray-400">Carregando seus pedidos...</p>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-10 flex flex-col items-center gap-4">
                                        <span className="material-symbols-outlined text-4xl text-gray-200">shopping_bag</span>
                                        <p className="text-gray-500">Você ainda não realizou nenhum pedido.</p>
                                        <button onClick={() => navigateTo('shop')} className="text-primary font-bold hover:underline">Ir para a loja</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map(order => (
                                            <div key={order.id} className="p-4 rounded-2xl border border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-sm dark:text-white">Pedido #{order.id.slice(0, 8)}</p>
                                                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-primary">R$ {order.total_amount.toFixed(2)}</p>
                                                    <span className={`text-[10px] font-black uppercase ${order.status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
