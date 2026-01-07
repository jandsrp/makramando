
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Product, CartItem } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import About from './pages/About';
import Auth from './pages/Auth';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

// Initial Mock Data
// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Painel Bohème Grande',
    description: 'Painel decorativo tecido à mão utilizando a técnica tradicional de macramê. Cada nó é feito com atenção aos detalhes para garantir durabilidade e beleza.',
    price: 189.90,
    stock: 10,
    size: '80x120cm',
    color: '#fdfbf7',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6tbJwF4SASHkh3iYnpzj9ysVXDdKJGSl69qbM8VcBdr57-6VLWZGyp1ZZU17fhMVjfad9NEaqhI6HFdkByCF8B-LfRV346iR-QEbZjUQo5bbpPzLRwacIOZGP2JzhtGtrYoH3yZU1Omp-bS7I06HBl1w4psv6qnigFPd6G2xZdoiq8DsRinDDSxyfK6XlT16DZcxYP-9HicpkVnP2U3UggUo0zgI3b5rhr1auF5fIlSer_WbkAQfYvJuw9-Q1_EV9758X35XCPpM',
    category: 'Painéis de Parede',
    is_bestseller: true
  },
  {
    id: '2',
    name: 'Suporte Suspenso Natural',
    description: 'Ideal para vasos médios, traz vida para qualquer canto com um toque rústico e natural.',
    price: 45.00,
    stock: 15,
    size: 'Padrão',
    color: '#61896f',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCftq0lsAigxqjgrB8h-7T4uqh1uhmoxcPLmT6wjz72XNAMKVOlb5PDiS-EeyoJ673YzDDehVFa_rdPUtIar62MvTzbcE2EOjG0VhiJpJH9NjSxo9NZLnHFe2c26O5LWY2g1IFFMUKnxZ5NdolnsWUfVMilFP1WwUKo1IUIhGzQkSufbFOaxvUyBJKgyh3RMt3JzEUSFrCcuPkbSJw7FMsQod_pmI18-yGaRRR9OA1vOVMDtq9AMUeJt1xU12i9s0xs2Z3_P8osCl4',
    category: 'Suportes para Plantas',
    is_new: true
  },
  {
    id: '3',
    name: 'Porta-Copos Trançado',
    description: 'Conjunto com 4 peças. Proteção e estilo para sua mesa em cada detalhe.',
    price: 60.00,
    stock: 20,
    size: '10cm',
    color: '#D2B48C',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANAzecqq4VWI7xQpIYmOPU2FqxdrPRMGfv5k_RxArHVSUYTk1C5BmKuJ0mA_ArC8G361qLv5rMLdGf3RohP12C6rmLvghm7SDoyhFz0gxgsGU3tTHKPjnyKohwCPXRCZAgzsdAJYPQI2xCtWX7WgHtUwoD1O6As3QJr_jB17HLoO5_kPlfexMAVBKzXBdqPwlfs1WGmJ0OMuG8GiDTY8V6RlQcKxwgBBtoBMZHXAEWX-11znr5J99-7yDH11pb_dgoo-hwBbSCY0E',
    category: 'Acessórios'
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      //.order('created_at', { ascending: false }); // Optional sorting

      if (data) {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('macrame_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('macrame_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('macrame_cart', JSON.stringify(cart));
  }, [cart]);

  const navigateTo = (view: View, productId?: string) => {
    setCurrentView(view);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo(0, 0);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      // Logic simplified: same product ID = same item (ignoring variant selection for now as we flattened it)
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    navigateTo('cart');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const selectedProduct = useMemo(() =>
    products.find(p => p.id === selectedProductId),
    [products, selectedProductId]);

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <Home products={products} navigateTo={navigateTo} />;
      case 'shop': return <Shop products={products} navigateTo={navigateTo} />;
      case 'product': return selectedProduct ? <ProductDetail product={selectedProduct} addToCart={addToCart} navigateTo={navigateTo} /> : <Home products={products} navigateTo={navigateTo} />;
      case 'cart': return <Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} navigateTo={navigateTo} />;
      case 'checkout': return <Checkout cart={cart} navigateTo={navigateTo} />;
      case 'admin': return <Admin products={products} addProduct={addProduct} setProducts={setProducts} />;
      case 'contact': return <Contact />;
      case 'about': return <About navigateTo={navigateTo} />;
      case 'auth': return <Auth navigateTo={navigateTo} />;
      default: return <Home products={products} navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView={currentView} navigateTo={navigateTo} cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} session={session} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default App;
