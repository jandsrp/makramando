
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  size: string | null;
  color: string | null;
  image_url: string | null;
  images?: string[] | null;
  created_at?: string;
  // UI Fields
  category?: string;
  is_bestseller?: boolean;
  is_new?: boolean;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'master_admin' | 'customer';
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export type View = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'admin' | 'contact' | 'about' | 'auth' | 'account';

export interface AppState {
  currentView: View;
  selectedProductId: string | null;
  products: Product[];
  cart: CartItem[];
}

export interface AuthContextType {
  session: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
}

