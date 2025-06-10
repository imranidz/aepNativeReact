import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  category: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  title: string;
  image: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (name: string, category: string) => void;
  isInCart: (name: string, category: string) => boolean;
  incrementQuantity: (name: string, category: string) => void;
  decrementQuantity: (name: string, category: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.name === item.name && i.category === item.category
      );
      if (existing) {
        return prev.map(i =>
          i.name === item.name && i.category === item.category
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string, category: string) => {
    setCart(prev => prev.filter(i => !(i.name === name && i.category === category)));
  };

  const isInCart = (name: string, category: string) => {
    return cart.some(i => i.name === name && i.category === category);
  };

  const incrementQuantity = (name: string, category: string) => {
    setCart(prev => prev.map(i =>
      i.name === name && i.category === category
        ? { ...i, quantity: i.quantity + 1 }
        : i
    ));
  };

  const decrementQuantity = (name: string, category: string) => {
    setCart(prev => prev.flatMap(i => {
      if (i.name === name && i.category === category) {
        if (i.quantity > 1) {
          return { ...i, quantity: i.quantity - 1 };
        } else {
          return [];
        }
      }
      return i;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart, incrementQuantity, decrementQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
} 