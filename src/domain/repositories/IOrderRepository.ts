import { IOrder, ISalesSummary } from '../../types';

export interface IOrderRepository {
  placeOrder(order: Omit<IOrder, 'cashier'>): Promise<IOrder>;
  getAllOrders(): Promise<IOrder[]>;
  getSalesSummary(startDate?: string, endDate?: string): Promise<ISalesSummary>;
  syncOfflineOrders(orders: IOrder[]): Promise<number>;
}
