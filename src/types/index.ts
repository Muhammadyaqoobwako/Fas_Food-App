export type UserRole = 'cashier' | 'admin' | 'manager' | 'driver' | 'customer' | 'owner';

export interface ICashier {
  id?: string;
  username: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  joinedAt?: string;
  restaurantName?: string;
}

export interface IOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  servedWith?: string;
  colour?: string;
  flavour?: string;
  type?: string;
}

export interface IOrder {
  _id?: string;
  category: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips';
  items: IOrderItem[];
  totalAmount: number;
  cashier: string;
  status?: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'completed';
  customerName?: string;
  deliveryAddress?: string;
  assignedDriver?: string;
  offlineCreatedAt?: string;
  createdAt?: string;
}

export interface IMenuItem {
  _id?: string;
  category: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips';
  name: string;
  price: number;
  sizeOrWeight: string;
  options: string[];
  isAvailable: boolean;
  imageUrl?: string;
  restaurantName?: string;
}

export interface ISalesSummary {
  totalRevenue: number;
  totalOrders: number;
  salesByCategory: Record<'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips', number>;
}

export interface IOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  emoji: string;
  validUntil: string;
  color: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'delivery';
  read: boolean;
  timestamp: string;
}

export interface IFeedback {
  id: string;
  orderId: string;
  customerName: string;
  restaurantRating: number;
  restaurantComment: string;
  riderName: string;
  riderRating: number;
  riderComment: string;
  createdAt: string;
}

export interface IChatMessage {
  id: string;
  orderId: string;
  sender: string;
  senderRole: 'customer' | 'rider';
  message: string;
  createdAt: string;
}
