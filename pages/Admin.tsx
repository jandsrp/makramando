
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../services/supabase';
import { ProductForm } from '../components/Admin/ProductForm';

interface AdminProps {
  products: Product[]; // Currently passing prop but we might want to refetch for admin specifics
  setProducts: (p: Product[]) => void; // To update global state if needed
  addProduct: (p: Product) => void;
}

const Admin: React.FC<AdminProps> = ({ products: initialProducts, setProducts: setGlobalProducts }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch products specific to Admin interaction (or just reuse global)
  // Here we fetch to ensure we have latest data
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
      setGlobalProducts(data || []); // Sync with App
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir produto.');
        console.error(error);
      } else {
        fetchProducts();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black dark:text-white">Painel Administrativo</h1>
          <p className="text-gray-500 mt-2">Gerencie seu inventário de macramê.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary-dark text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg"
        >
          <span className="material-symbols-outlined">{isAdding ? 'close' : 'add'}</span>
          {isAdding ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {isAdding && (
        <ProductForm
          onSuccess={() => { setIsAdding(false); fetchProducts(); }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Product Table */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
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
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Carregando produtos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum produto cadastrado.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-gray-100 overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="material-symbols-outlined text-sm">image</span>
                            </div>
                          )}
                        </div>
                        <span className="font-bold dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">R$ {p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
