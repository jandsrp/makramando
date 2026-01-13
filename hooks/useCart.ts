import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { CartItem, Product } from '../types';
import { Session } from '@supabase/supabase-js';

export const useCart = (session: Session | null) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial cart
    useEffect(() => {
        const loadCart = async () => {
            if (session?.user) {
                setIsLoading(true);
                // Fetch from Supabase
                const { data: cartItems, error } = await supabase
                    .from('carts')
                    .select('*, product:products(*)')
                    .eq('user_id', session.user.id);

                if (!error && cartItems) {
                    // Transform Supabase data to CartItem format
                    // Check if product is available (in case it was deleted)
                    const formattedCart: CartItem[] = cartItems
                        .filter((item: any) => item.product)
                        .map((item: any) => ({
                            id: item.product.id,
                            name: item.product.name,
                            price: item.product.price,
                            image_url: item.product.image_url,
                            quantity: item.quantity,
                            // Additional fields if needed from Product type
                            description: item.product.description,
                            category: item.product.category,
                            stock: item.product.stock,
                            size: item.product.size,
                            color: item.product.color
                        }));
                    setCart(formattedCart);
                }
            } else {
                // Load from LocalStorage
                const saved = localStorage.getItem('macrame_cart');
                if (saved) {
                    try {
                        setCart(JSON.parse(saved));
                    } catch (e) {
                        console.error("Error parsing local cart", e);
                        setCart([]);
                    }
                } else {
                    setCart([]);
                }
            }
            setIsLoading(false);
        };

        loadCart();
    }, [session]);

    // Sync LocalStorage when not logged in
    useEffect(() => {
        if (!session) {
            localStorage.setItem('macrame_cart', JSON.stringify(cart));
        }
    }, [cart, session]);

    // Merging Logic: When user logs in, merge local cart to DB
    useEffect(() => {
        const mergeCart = async () => {
            if (session?.user) {
                const localCartStr = localStorage.getItem('macrame_cart');
                if (localCartStr) {
                    const localCart: CartItem[] = JSON.parse(localCartStr);
                    if (localCart.length > 0) {
                        // Upsert each item to Supabase
                        for (const item of localCart) {
                            // Check if already in DB to update quantity vs insert
                            // Or let Supabase handle conflict on unique constraint (user_id, product_id)
                            // We'll trust the UPSERT if we had ON CONFLICT, but simplified approach:

                            // First try to select existing
                            const { data: existing } = await supabase
                                .from('carts')
                                .select('*')
                                .eq('user_id', session.user.id)
                                .eq('product_id', item.id)
                                .single();

                            if (existing) {
                                // Update quantity
                                await supabase
                                    .from('carts')
                                    .update({ quantity: existing.quantity + item.quantity })
                                    .eq('id', existing.id);
                            } else {
                                // Insert
                                await supabase
                                    .from('carts')
                                    .insert({
                                        user_id: session.user.id,
                                        product_id: item.id,
                                        quantity: item.quantity
                                    });
                            }
                        }
                        // Clear local cart after merge
                        localStorage.removeItem('macrame_cart');

                        // Refetch to ensure state is synced
                        const { data: cartItems } = await supabase
                            .from('carts')
                            .select('*, product:products(*)')
                            .eq('user_id', session.user.id);

                        if (cartItems) {
                            const formattedCart: CartItem[] = cartItems
                                .filter((item: any) => item.product)
                                .map((item: any) => ({
                                    id: item.product.id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image_url: item.product.image_url,
                                    quantity: item.quantity,
                                    description: item.product.description,
                                    category: item.product.category,
                                    stock: item.product.stock,
                                    size: item.product.size,
                                    color: item.product.color
                                }));
                            setCart(formattedCart);
                        }
                    }
                }
            }
        };

        // Only run if we just logged in (session became available) and we have a local cart
        // Ideally this runs once per session change to truthy
        mergeCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id]); // Run when user ID changes (login)


    const addToCart = async (product: Product, quantity: number) => {
        if (session?.user) {
            // Optimistic update
            setCart(prev => {
                const existing = prev.find(item => item.id === product.id);
                if (existing) {
                    return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
                }
                return [...prev, { ...product, quantity }];
            });

            // DB Update
            const { data: existing } = await supabase
                .from('carts')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('product_id', product.id)
                .single();

            if (existing) {
                await supabase.from('carts').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
            } else {
                await supabase.from('carts').insert({
                    user_id: session.user.id,
                    product_id: product.id,
                    quantity: quantity
                });
            }
        } else {
            setCart(prev => {
                const existing = prev.find(item => item.id === product.id);
                if (existing) {
                    return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
                }
                return [...prev, { ...product, quantity }];
            });
        }
    };

    const removeFromCart = async (id: string) => {
        if (session?.user) {
            setCart(prev => prev.filter(item => item.id !== id));
            await supabase.from('carts').delete().eq('user_id', session.user.id).eq('product_id', id);
        } else {
            setCart(prev => prev.filter(item => item.id !== id));
        }
    };

    const updateQuantity = async (id: string, delta: number) => {
        if (session?.user) {
            // We'll calculate new quantity first to avoid invalid state
            let newQuantity = 0;
            setCart(prev => prev.map(item => {
                if (item.id === id) {
                    newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }));

            // Wait for the state update (not guaranteed instantly accessible but for the logic flow)
            // Better: use the calculated newQuantity
            if (newQuantity > 0) {
                await supabase
                    .from('carts')
                    .update({ quantity: newQuantity })
                    .eq('user_id', session.user.id)
                    .eq('product_id', id);
            }
        } else {
            setCart(prev => prev.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
            }));
        }
    };

    const clearCart = async () => {
        setCart([]);
        if (session?.user) {
            await supabase.from('carts').delete().eq('user_id', session.user.id);
        } else {
            localStorage.removeItem('macrame_cart');
        }
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading
    };
};
