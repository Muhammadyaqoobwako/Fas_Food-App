import React, { createContext, useState, useContext } from 'react';

export interface CartItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  servedWith?: string;
  colour?: string;
  flavour?: string;
  type?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setCartItems((prevItems) => {
      // Find matching item with the same description and customization parameters
      const index = prevItems.findIndex(
        (item) =>
          item.description === newItem.description &&
          item.servedWith === newItem.servedWith &&
          item.colour === newItem.colour &&
          item.flavour === newItem.flavour &&
          item.type === newItem.type
      );

      if (index > -1) {
        const updated = [...prevItems];
        updated[index].quantity += newItem.quantity;
        return updated;
      }

      return [...prevItems, { ...newItem, id: Math.random().toString(36).substring(7) }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
