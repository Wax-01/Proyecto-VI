import { createContext, useEffect, useState } from "react";
import { supabase } from "../utils/Supabase";
import type { Book } from "./ItemContext";

const STORAGE_KEY = "bhook_cart";

export interface CartItem {
    book: Book;
    cantidad: number;
}

interface CheckoutResult {
    success: boolean;
    error?: string;
    venta_id?: number;
    total?: number;
    puntos_ganados?: number;
    puntos_totales?: number;
}

interface CartContextProps {
    items: CartItem[];
    isOpen: boolean;
    totalItems: number;
    totalPrice: number;
    addToCart: (book: Book, cantidad?: number) => void;
    removeFromCart: (bookId: number) => void;
    updateQty: (bookId: number, cantidad: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    checkout: () => Promise<CheckoutResult>;
}

function readStoredCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export const CartContext = createContext({} as CartContextProps);

export const CartProvider = ({ children }: any) => {
    const [items, setItems] = useState<CartItem[]>(() => readStoredCart());
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = (book: Book, cantidad: number = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.book.id === book.id);
            if (existing) {
                return prev.map((i) =>
                    i.book.id === book.id ? { ...i, cantidad: i.cantidad + cantidad } : i
                );
            }
            return [...prev, { book, cantidad }];
        });
        setIsOpen(true);
    };

    const removeFromCart = (bookId: number) => {
        setItems((prev) => prev.filter((i) => i.book.id !== bookId));
    };

    const updateQty = (bookId: number, cantidad: number) => {
        if (cantidad <= 0) {
            removeFromCart(bookId);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.book.id === bookId ? { ...i, cantidad } : i))
        );
    };

    const clearCart = () => setItems([]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen((prev) => !prev);

    const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.cantidad * i.book.precio, 0);

    /**
     * Ejecuta la compra a través de la función segura `checkout_cart` en Supabase:
     * el precio de cada libro se recalcula en el servidor (nunca se confía en el
     * precio del cliente) y los puntos se otorgan de forma atómica junto a la venta.
     */
    const checkout = async (): Promise<CheckoutResult> => {
        if (items.length === 0) {
            return { success: false, error: "El carrito está vacío." };
        }

        const p_items = items.map((i) => ({ libro_id: i.book.id, cantidad: i.cantidad }));
        const { data, error } = await supabase.rpc("checkout_cart", { p_items });

        if (error) {
            return { success: false, error: error.message };
        }

        clearCart();
        return {
            success: true,
            venta_id: data.venta_id,
            total: data.total,
            puntos_ganados: data.puntos_ganados,
            puntos_totales: data.puntos_totales,
        };
    };

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                totalItems,
                totalPrice,
                addToCart,
                removeFromCart,
                updateQty,
                clearCart,
                openCart,
                closeCart,
                toggleCart,
                checkout,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
