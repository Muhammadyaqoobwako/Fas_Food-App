import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICashier, IOrder, IOrderItem, IMenuItem, UserRole, IFeedback, IChatMessage } from '../../types';
import { RemoteDataSource } from '../../data/datasources/RemoteDataSource';
import { LocalDataSource } from '../../data/datasources/LocalDataSource';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { OrderRepository } from '../../data/repositories/OrderRepository';
import { LoginCashier } from '../../domain/usecases/LoginCashier';
import { PlaceOrder } from '../../domain/usecases/PlaceOrder';
import { GetSalesSummary } from '../../domain/usecases/GetSalesSummary';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  register: (fullName: string, email: string, username: string, password: string, role?: UserRole, restaurantName?: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (item: IOrderItem, category: IOrder['category']) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  submitOrder: (customerName?: string, deliveryAddress?: string) => Promise<IOrder>;
  syncOffline: () => Promise<number>;
  setOnlineStatus: (status: boolean) => void;
  refreshOrders: () => Promise<void>;
  orderRepository: OrderRepository;
  menuItems: IMenuItem[];
  addMenuItem: (item: Omit<IMenuItem, '_id'>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  assignRiderToOrder: (orderId: string, riderName: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: IOrder['status']) => Promise<void>;
  riders: { username: string; email: string }[];
  toast: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
  feedbacks: IFeedback[];
  addFeedback: (feedback: Omit<IFeedback, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (username: string, email: string, avatarUrl: string) => Promise<void>;
  chatMessages: IChatMessage[];
  sendChatMessage: (orderId: string, message: string) => Promise<void>;
  favoriteFoods: string[];
  favoriteRestaurants: string[];
  toggleFavoriteFood: (id: string) => Promise<void>;
  toggleFavoriteRestaurant: (name: string) => Promise<void>;
  employeeBonuses: Record<string, number>;
  giveEmployeeBonus: (employeeName: string, amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Instantiate dependencies
const remoteDS = new RemoteDataSource();
const localDS = new LocalDataSource();
const authRepo = new AuthRepository(remoteDS, localDS);
const orderRepo = new OrderRepository(remoteDS, localDS);

const loginUC = new LoginCashier(authRepo);
const placeOrderUC = new PlaceOrder(orderRepo);

const DEFAULT_MENU_ITEMS: IMenuItem[] = [
  // Sprite
  { _id: 's1', category: 'Sprite', name: 'Sprite Regular', price: 150.0, sizeOrWeight: '300ml', options: ['Cold', 'Warm'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1625772290748-160b61601687?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  { _id: 's2', category: 'Sprite', name: 'Sprite Duo Pack', price: 300.0, sizeOrWeight: '1000ml', options: ['Cold', 'Warm'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1527960656306-fffe3c61793e?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  { _id: 's3', category: 'Sprite', name: 'Sprite Zero', price: 160.0, sizeOrWeight: '300ml', options: ['Cold'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  // Coke
  { _id: 'co1', category: 'Coke', name: 'Coke Regular', price: 150.0, sizeOrWeight: '330ml', options: ['Regular', 'Diet'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  { _id: 'co2', category: 'Coke', name: 'Coke Light', price: 160.0, sizeOrWeight: '330ml', options: ['Diet'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  { _id: 'co3', category: 'Coke', name: 'Coke Share Pack', price: 290.0, sizeOrWeight: '1000ml', options: ['Regular', 'Diet'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  // Burger
  { _id: 'b1', category: 'Burger', name: 'Beef Burger', price: 450.0, sizeOrWeight: '150g', options: ['Chips', 'Salad', 'None'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60', restaurantName: 'The Burger Bistro' },
  { _id: 'b2', category: 'Burger', name: 'Chicken Cheeseburger', price: 490.0, sizeOrWeight: '180g', options: ['Chips', 'Salad', 'None'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&auto=format&fit=crop&q=60', restaurantName: 'The Burger Bistro' },
  { _id: 'b3', category: 'Burger', name: 'Double King Burger', price: 650.0, sizeOrWeight: '300g', options: ['Chips', 'Salad'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=60', restaurantName: 'The Burger Bistro' },
  // Pizza
  { _id: 'p1', category: 'Pizza', name: 'Regina Pizza', price: 550.0, sizeOrWeight: 'Large', options: ['Thin Crust', 'Thick Crust'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60', restaurantName: 'Pizza Hut Hotel' },
  { _id: 'p2', category: 'Pizza', name: 'Margherita Pizza', price: 480.0, sizeOrWeight: 'Medium', options: ['Thin Crust', 'Thick Crust'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&auto=format&fit=crop&q=60', restaurantName: 'Pizza Hut Hotel' },
  { _id: 'p3', category: 'Pizza', name: 'Pepperoni Passion', price: 620.0, sizeOrWeight: 'Large', options: ['Thin Crust', 'Gluten Free'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop&q=60', restaurantName: 'Pizza Hut Hotel' },
  // IceCream
  { _id: 'i1', category: 'IceCream', name: 'Vanilla Soft Serve', price: 120.0, sizeOrWeight: 'Cup', options: ['White', 'Chocolate Dip'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  { _id: 'i2', category: 'IceCream', name: 'Strawberry Sundae', price: 220.0, sizeOrWeight: 'Glass', options: ['Strawberry Flavour', 'Vanilla Flavour'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  { _id: 'i3', category: 'IceCream', name: 'Chocolate Feast', price: 250.0, sizeOrWeight: 'Tub', options: ['Chocolate Flavour'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop&q=60', restaurantName: 'Fas Food Palace' },
  // Chips
  { _id: 'ch1', category: 'Chips', name: 'Regular Chips', price: 120.0, sizeOrWeight: 'Small', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=60', restaurantName: 'The Burger Bistro' },
  { _id: 'ch2', category: 'Chips', name: 'Large Share Chips', price: 240.0, sizeOrWeight: 'Large', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&auto=format&fit=crop&q=60', restaurantName: 'The Burger Bistro' },
  { _id: 'ch3', category: 'Chips', name: 'Jumbo Slap Chips', price: 320.0, sizeOrWeight: 'Jumbo', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'], isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&auto=format&fit=crop&q=60', restaurantName: 'The Burger Bistro' },
];

const DEFAULT_RIDERS = [
  { username: 'Rider Thabo', email: 'thabo@fasfood.co.za' },
  { username: 'Rider Ahmed', email: 'ahmed@fasfood.co.za' },
  { username: 'Rider Sipho', email: 'sipho@fasfood.co.za' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cashier, setCashier] = useState<ICashier | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cart, setCart] = useState<IOrderItem[]>([]);
  const [cartCategory, setCartCategory] = useState<IOrder['category'] | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<IOrder[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<string[]>([]);
  const [employeeBonuses, setEmployeeBonuses] = useState<Record<string, number>>({});

  const showToast = (msg: string) => {
    setToast(msg);
  };

  const clearToast = () => {
    setToast(null);
  };
  const [loading, setLoading] = useState<boolean>(true);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

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

        // Load feedbacks
        const savedFeedbacks = await AsyncStorage.getItem('store_feedbacks_v1');
        if (savedFeedbacks) {
          setFeedbacks(JSON.parse(savedFeedbacks));
        }

        // Load chat messages
        const savedChat = await AsyncStorage.getItem('store_chat_messages_v1');
        if (savedChat) {
          setChatMessages(JSON.parse(savedChat));
        }

        // Load favorite foods
        const storedFavFoods = await AsyncStorage.getItem('store_fav_foods_v1');
        if (storedFavFoods) {
          setFavoriteFoods(JSON.parse(storedFavFoods));
        }

        // Load favorite restaurants
        const storedFavRestaurants = await AsyncStorage.getItem('store_fav_restaurants_v1');
        if (storedFavRestaurants) {
          setFavoriteRestaurants(JSON.parse(storedFavRestaurants));
        }

        // Load employee bonuses
        const storedBonuses = await AsyncStorage.getItem('store_employee_bonuses_v1');
        if (storedBonuses) {
          setEmployeeBonuses(JSON.parse(storedBonuses));
        }

        // Load custom riders
        const savedRiders = await AsyncStorage.getItem('store_riders_v1');
        if (savedRiders) {
          setRiders(JSON.parse(savedRiders));
        } else {
          setRiders(DEFAULT_RIDERS);
          await AsyncStorage.setItem('store_riders_v1', JSON.stringify(DEFAULT_RIDERS));
        }
        
        // Load custom menu from backend if we can
        let loadedMenu = false;
        if (storedToken && !storedToken.startsWith('mock-')) {
          try {
            const remoteMenu = await remoteDS.getMenuItems();
            if (remoteMenu && remoteMenu.length > 0) {
              setMenuItems(remoteMenu);
              loadedMenu = true;
            }
          } catch (err) {
            console.warn('Failed to load menu from remote server, using offline cache:', err);
          }
        }

        if (!loadedMenu) {
          const savedMenu = await AsyncStorage.getItem('store_menu');
          if (savedMenu) {
            setMenuItems(JSON.parse(savedMenu));
          } else {
            setMenuItems(DEFAULT_MENU_ITEMS);
            await AsyncStorage.setItem('store_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  const [riders, setRiders] = useState(DEFAULT_RIDERS);

  const loadOrdersAndQueue = async () => {
    try {
      const cached = await AsyncStorage.getItem('store_orders_v1');
      if (cached) {
        setOrders(JSON.parse(cached));
      } else {
        const allOrders = await orderRepo.getAllOrders();
        const formattedOrders = allOrders.map(o => ({
          ...o,
          status: o.status || 'pending',
          _id: o._id || `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
        setOrders(formattedOrders);
        await AsyncStorage.setItem('store_orders_v1', JSON.stringify(formattedOrders));
      }

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

  const register = async (fullName: string, email: string, username: string, password: string, role: UserRole = 'customer', restaurantName?: string) => {
    setLoading(true);
    try {
      const result = await remoteDS.register(fullName, email, username, password, role, restaurantName);
      await localDS.saveToken(result.token);
      await localDS.saveCashier(result.cashier);
      setCashier(result.cashier);
      setIsAuthenticated(true);

      if (role === 'driver') {
        setRiders(prev => {
          const updated = [...prev, { username: fullName || username, email }];
          AsyncStorage.setItem('store_riders_v1', JSON.stringify(updated)).catch(err => {
            console.error('Failed to save riders list:', err);
          });
          return updated;
        });
      }
      await loadOrdersAndQueue();
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<IMenuItem, '_id'>) => {
    const token = await localDS.getToken();
    const restaurantName = item.restaurantName || cashier?.restaurantName || 'Fas Food Palace';
    const payload = {
      ...item,
      restaurantName,
    };

    if (token && !token.startsWith('mock-')) {
      try {
        const created = await remoteDS.createMenuItem(payload, token);
        setMenuItems(prev => [...prev, created]);
        return;
      } catch (err) {
        console.error('Failed to create menu item on remote backend:', err);
      }
    }

    // Local fallback
    const newItem: IMenuItem = {
      ...payload,
      _id: `dynamic-${Date.now()}`,
      isAvailable: true,
    };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    await AsyncStorage.setItem('store_menu', JSON.stringify(updated));
  };

  const deleteMenuItem = async (id: string) => {
    const token = await localDS.getToken();
    if (token && !token.startsWith('mock-') && !id.startsWith('dynamic-')) {
      try {
        await remoteDS.deleteMenuItem(id, token);
        setMenuItems(prev => prev.filter(item => item._id !== id));
        return;
      } catch (err) {
        console.error('Failed to delete menu item on remote backend:', err);
      }
    }

    // Local fallback
    const updated = menuItems.filter(item => item._id !== id);
    setMenuItems(updated);
    await AsyncStorage.setItem('store_menu', JSON.stringify(updated));
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
    showToast(`"${item.description}" added to cart. Ready to check out!`);
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

  const saveOrdersToCache = async (newOrders: IOrder[]) => {
    setOrders(newOrders);
    await AsyncStorage.setItem('store_orders_v1', JSON.stringify(newOrders));
  };

  const assignRiderToOrder = async (orderId: string, riderName: string) => {
    const token = await localDS.getToken();
    if (token && !token.startsWith('mock-') && !orderId.startsWith('order-')) {
      try {
        const updatedOrder = await remoteDS.updateOrder(orderId, {
          assignedDriver: riderName,
          status: 'ready',
        }, token);
        setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        return;
      } catch (err) {
        console.error('Failed to assign rider on remote backend:', err);
      }
    }

    // Local fallback
    const updated = orders.map(o => {
      if (o._id === orderId) {
        return {
          ...o,
          assignedDriver: riderName,
          status: 'ready' as const,
        };
      }
      return o;
    });
    await saveOrdersToCache(updated);
  };

  const updateOrderStatus = async (orderId: string, status: IOrder['status']) => {
    const token = await localDS.getToken();
    if (token && !token.startsWith('mock-') && !orderId.startsWith('order-')) {
      try {
        const updatedOrder = await remoteDS.updateOrder(orderId, { status }, token);
        setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        return;
      } catch (err) {
        console.error('Failed to update order status on remote backend:', err);
      }
    }

    // Local fallback
    const updated = orders.map(o => {
      if (o._id === orderId) {
        return {
          ...o,
          status,
        };
      }
      return o;
    });
    await saveOrdersToCache(updated);
  };

  const submitOrder = async (customerName?: string, deliveryAddress?: string): Promise<IOrder> => {
    if (!cartCategory) {
      throw new Error('Cart is empty.');
    }
    setLoading(true);
    try {
      const order = await placeOrderUC.execute(cartCategory, cart, customerName, deliveryAddress);
      clearCart();
      
      const cached = await AsyncStorage.getItem('store_orders_v1');
      let ordersList = cached ? JSON.parse(cached) : [];
      
      const orderWithId = {
        ...order,
        _id: order._id || `order-${Date.now()}`,
        status: order.status || 'pending',
        customerName: customerName || order.customerName,
        deliveryAddress: deliveryAddress || order.deliveryAddress,
        createdAt: order.createdAt || new Date().toISOString()
      };
      
      ordersList = [orderWithId, ...ordersList];
      await saveOrdersToCache(ordersList);
      await loadOrdersAndQueue();
      return orderWithId;
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

  const addFeedback = async (feedback: Omit<IFeedback, 'id' | 'createdAt'>) => {
    const newFeedback: IFeedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    await AsyncStorage.setItem('store_feedbacks_v1', JSON.stringify(updated));
  };

  const updateProfile = async (username: string, email: string, avatarUrl: string) => {
    if (!cashier) return;
    const updatedCashier: ICashier = {
      ...cashier,
      username,
      email,
      avatar: avatarUrl,
    };
    setCashier(updatedCashier);
    await localDS.saveCashier(updatedCashier);
    showToast('Profile details updated successfully!');
  };

  const sendChatMessage = async (orderId: string, message: string) => {
    if (!cashier) return;
    const newMessage: IChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      sender: cashier.username,
      senderRole: cashier.role === 'driver' ? 'rider' : 'customer',
      message,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => {
      const updated = [...prev, newMessage];
      AsyncStorage.setItem('store_chat_messages_v1', JSON.stringify(updated)).catch(err => {
        console.error('Failed to save chat messages:', err);
      });
      return updated;
    });
  };

  const toggleFavoriteFood = async (id: string) => {
    setFavoriteFoods(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      AsyncStorage.setItem('store_fav_foods_v1', JSON.stringify(updated)).catch(err => {
        console.error('Failed to save favorite foods:', err);
      });
      // Find food name to show a premium toast message
      const foodItem = menuItems.find(item => item._id === id);
      const foodName = foodItem ? foodItem.name : 'Food';
      showToast(exists ? `"${foodName}" removed from favorites.` : `"${foodName}" added to favorites!`);
      return updated;
    });
  };

  const toggleFavoriteRestaurant = async (name: string) => {
    setFavoriteRestaurants(prev => {
      const exists = prev.includes(name);
      const updated = exists ? prev.filter(r => r !== name) : [...prev, name];
      AsyncStorage.setItem('store_fav_restaurants_v1', JSON.stringify(updated)).catch(err => {
        console.error('Failed to save favorite restaurants:', err);
      });
      showToast(exists ? `"${name}" removed from favorites.` : `"${name}" added to favorites!`);
      return updated;
    });
  };

  const giveEmployeeBonus = async (employeeName: string, amount: number) => {
    setEmployeeBonuses(prev => {
      const current = prev[employeeName] || 0;
      const updated = {
        ...prev,
        [employeeName]: current + amount,
      };
      AsyncStorage.setItem('store_employee_bonuses_v1', JSON.stringify(updated)).catch(err => {
        console.error('Failed to save employee bonuses:', err);
      });
      showToast(`Bonus of R ${amount.toFixed(2)} awarded to ${employeeName}!`);
      return updated;
    });
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
        register,
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
        menuItems,
        addMenuItem,
        deleteMenuItem,
        assignRiderToOrder,
        updateOrderStatus,
        riders,
        toast,
        showToast,
        clearToast,
        feedbacks,
        addFeedback,
        updateProfile,
        chatMessages,
        sendChatMessage,
        favoriteFoods,
        favoriteRestaurants,
        toggleFavoriteFood,
        toggleFavoriteRestaurant,
        employeeBonuses,
        giveEmployeeBonus,
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
