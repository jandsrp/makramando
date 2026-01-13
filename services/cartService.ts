import { supabase } from './supabase';
import { Product, CartItem } from '../types';

export interface CartItemDB {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    product?: Product;
}

/**
 * Get user's cart from database
 */
export const getCart = async (userId: string): Promise<CartItem[]> => {
    const { data, error } = await supabase
        .from('carts')
        .select(`
            *,
            product:products(*)
        `)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching cart:', error);
        return [];
    }

    // Transform database cart to CartItem format
    return (data || []).map((item: any) => ({
        ...item.product,
        quantity: item.quantity,
    }));
};

/**
 * Add item to cart or update quantity if exists
 */
export const addToCart = async (
    userId: string,
    productId: string,
    quantity: number
): Promise<boolean> => {
    try {
        // Check if item already exists
        const { data: existing } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (existing) {
            // Update quantity
            const { error } = await supabase
                .from('carts')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new item
            const { error } = await supabase
                .from('carts')
                .insert({
                    user_id: userId,
                    product_id: productId,
                    quantity,
                });

            if (error) throw error;
        }

        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
    }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
    userId: string,
    productId: string,
    quantity: number
): Promise<boolean> => {
    try {
        if (quantity <= 0) {
            return await removeFromCart(userId, productId);
        }

        const { error } = await supabase
            .from('carts')
            .update({ quantity })
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating cart item:', error);
        return false;
    }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (
    userId: string,
    productId: string
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing from cart:', error);
        return false;
    }
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
};

/**
 * Sync local cart with server cart (merge)
 */
export const syncLocalCart = async (
    userId: string,
    localCart: CartItem[]
): Promise<boolean> => {
    try {
        // Add each local cart item to server
        for (const item of localCart) {
            await addToCart(userId, item.id, item.quantity);
        }
        return true;
    } catch (error) {
        console.error('Error syncing cart:', error);
        return false;
    }
};
