import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICashier, IOrder, IOrderItem } from '../../types';
import { RemoteDataSource } from '../../data/datasources/RemoteDataSource';
import { LocalDataSource } from '../../data/datasources/LocalDataSource';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { OrderRepository } from '../../data/repositories/OrderRepository';
import { LoginCashier } from '../../domain/usecases/LoginCashier';
import { PlaceOrder } from '../../domain/usecases/PlaceOrder';
import { GetSalesSummary } from '../../domain/usecases/GetSalesSummary';

interface AppContextType {
  cashier: ICashier | null;
  isAuthenticated: boolean;
  cart: IOrderItem[];
  cartCategory: IOrder['category'] | null;
  orders: IOrder[];
  offlineQueue: IOrder[];
  isOnline: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (item: IOrderItem, category: IOrder['category']) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  submitOrder: () => Promise<IOrder>;
  syncOffline: () => Promise<number>;
  setOnlineStatus: (status: boolean) => void;
  refreshOrders: () => Promise<void>;
  orderRepository: OrderRepository;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Instantiate dependencies
const remoteDS = new RemoteDataSource();
const localDS = new LocalDataSource();
const authRepo = new AuthRepository(remoteDS, localDS);
const orderRepo = new OrderRepository(remoteDS, localDS);

const loginUC = new LoginCashier(authRepo);
const placeOrderUC = new PlaceOrder(orderRepo);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cashier, setCashier] = useState<ICashier | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cart, setCart] = useState<IOrderItem[]>([]);
  const [cartCategory, setCartCategory] = useState<IOrder['category'] | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<IOrder[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth status & cache
  useEffect(() => {
    async function initSession() {
      try {
        const storedCashier = await authRepo.getCurrentCashier();
        const storedToken = await authRepo.getStoredToken();
        if (storedCashier && storedToken) {
          setCashier(storedCashier);
          setIsAuthenticated(true);
        }
        await loadOrdersAndQueue();
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  const loadOrdersAndQueue = async () => {
    try {
      const allOrders = await orderRepo.getAllOrders();
      setOrders(allOrders);

      const queue = await localDS.getOfflineOrders();
      setOfflineQueue(queue);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginUC.execute(username, password);
      setCashier(result.cashier);
      setIsAuthenticated(true);
      await loadOrdersAndQueue();
    } catch (err: any) {
      throw new Error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authRepo.logout();
      setCashier(null);
      setIsAuthenticated(false);
      setCart([]);
      setCartCategory(null);
      setOrders([]);
      setOfflineQueue([]);
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: IOrderItem, category: IOrder['category']) => {
    if (cartCategory && cartCategory !== category) {
      // Clear cart if adding item of a different category
      setCart([item]);
      setCartCategory(category);
    } else {
      // If item with same description, color, flavor, servedWith already in cart, increment quantity
      const existingIndex = cart.findIndex(
        i =>
          i.description === item.description &&
          i.servedWith === item.servedWith &&
          i.colour === item.colour &&
          i.flavour === item.flavour &&
          i.type === item.type
      );

      if (existingIndex > -1) {
        const updated = [...cart];
        updated[existingIndex].quantity += item.quantity;
        setCart(updated);
      } else {
        setCart([...cart, item]);
        setCartCategory(category);
      }
    }
  };

  const updateCartItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = quantity;
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    if (updated.length === 0) {
      setCartCategory(null);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCartCategory(null);
  };

  const submitOrder = async (): Promise<IOrder> => {
    if (!cartCategory) {
      throw new Error('Cart is empty.');
    }
    setLoading(true);
    try {
      const order = await placeOrderUC.execute(cartCategory, cart);
      clearCart();
      await loadOrdersAndQueue();
      return order;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const syncOffline = async (): Promise<number> => {
    setLoading(true);
    try {
      const count = await orderRepo.syncOfflineOrders();
      await loadOrdersAndQueue();
      return count;
    } catch (err: any) {
      throw new Error(err.message || 'Offline sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const setOnlineStatus = (status: boolean) => {
    setIsOnline(status);
  };

  const refreshOrders = async () => {
    await loadOrdersAndQueue();
  };

  return (
    <AppContext.Provider
      value={{
        cashier,
        isAuthenticated,
        cart,
        cartCategory,
        orders,
        offlineQueue,
        isOnline,
        loading,
        login,
        logout,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        submitOrder,
        syncOffline,
        setOnlineStatus,
        refreshOrders,
        orderRepository: orderRepo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
