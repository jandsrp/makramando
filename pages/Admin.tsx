import React, { useState, useEffect } from 'react';
import { Product, Profile, Category, Color, Size } from '../types';
import { supabase } from '../services/supabase';
import { ProductForm } from '../components/Admin/ProductForm';
import { UserManagement } from '../components/Admin/UserManagement';
import { AttributeManagement } from '../components/Admin/AttributeManagement';
import { useAdmin } from '../hooks/useAdmin';

interface AdminProps {
  products: Product[]; // Currently passing prop but we might want to refetch for admin specifics
  setProducts: (p: Product[]) => void; // To update global state if needed
  addProduct: (p: Product) => void;
}

const Admin: React.FC<AdminProps> = ({ products: initialProducts, setProducts: setGlobalProducts }) => {
  const { isAdmin, isMasterAdmin, isLoading: adminLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'attributes'>('products');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setProducts(data || []);
      setGlobalProducts(data || []);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name),
        order_items (
          *,
          products (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAdding(true);
  };

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="size-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-6">
          <span className="material-symbols-outlined text-4xl">block</span>
        </div>
        <h2 className="text-3xl font-black dark:text-white mb-4">Acesso Negado</h2>
        <p className="text-gray-500 text-center max-w-md">
          Você não tem permissão para acessar o painel administrativo. Apenas administradores podem visualizar este conteúdo.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black dark:text-white">Painel Administrativo</h1>
          <p className="text-gray-500 mt-2">Gerencie sua loja de macramê.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'attributes' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
            >
              Atributos
            </button>
            {isMasterAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
              >
                Usuários
              </button>
            )}
          </div>
          {activeTab === 'products' && (
            <button
              onClick={() => { setIsAdding(!isAdding); setEditingProduct(null); }}
              className="bg-primary hover:bg-primary-dark text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined">{isAdding ? 'close' : 'add'}</span>
              {isAdding ? 'Cancelar' : 'Novo Produto'}
            </button>
          )}
        </div>
      </div>

      {isAdding && activeTab === 'products' && (
        <ProductForm
          product={editingProduct}
          onSuccess={() => { setIsAdding(false); setEditingProduct(null); fetchProducts(); }}
          onCancel={() => { setIsAdding(false); setEditingProduct(null); }}
        />
      )}

      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        {activeTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Produto</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Categoria</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Preço</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Carregando...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum produto.</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.image_url || ''} className="size-12 rounded-lg object-cover bg-gray-100" />
                          <span className="font-bold dark:text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">R$ {p.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">ID Pedido</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Data</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Carregando...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum pedido.</td></tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 dark:text-white">{o.profiles?.full_name || 'Desconhecido'}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-primary">R$ {o.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.status === 'paid' ? 'bg-green-100 text-green-700' :
                          o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'attributes' ? (
          <AttributeManagement />
        ) : activeTab === 'users' && isMasterAdmin ? (
          <UserManagement currentUserProfile={profile} />
        ) : null}
      </div>
    </div>
  );
};

export default Admin;
