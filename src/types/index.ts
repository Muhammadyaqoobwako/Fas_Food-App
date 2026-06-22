export interface ICashier {
  username: string;
  role: string;
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
}

export interface ISalesSummary {
  totalRevenue: number;
  totalOrders: number;
  salesByCategory: Record<'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips', number>;
}
