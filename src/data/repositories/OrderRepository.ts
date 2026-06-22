import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { RemoteDataSource } from '../datasources/RemoteDataSource';
import { LocalDataSource } from '../datasources/LocalDataSource';
import { IOrder, ISalesSummary } from '../../types';

export class OrderRepository implements IOrderRepository {
  constructor(
    private remoteDataSource: RemoteDataSource,
    private localDataSource: LocalDataSource
  ) {}

  async placeOrder(order: Omit<IOrder, 'cashier'>): Promise<IOrder> {
    const token = await this.localDataSource.getToken();
    const cashierProfile = await this.localDataSource.getCashier();
    const cashierName = cashierProfile?.username || 'anonymous';

    const fullOrder: IOrder = {
      ...order,
      cashier: cashierName,
    };

    if (!token) {
      // Offline fallback since there's no auth session token
      fullOrder.offlineCreatedAt = new Date().toISOString();
      await this.localDataSource.addOfflineOrder(fullOrder);
      return fullOrder;
    }

    try {
      // Try online order placement
      return await this.remoteDataSource.placeOrder(order, token);
    } catch (err: any) {
      // If network fails, queue offline order
      console.log('Online order placement failed, caching offline:', err.message);
      fullOrder.offlineCreatedAt = new Date().toISOString();
      await this.localDataSource.addOfflineOrder(fullOrder);
      return fullOrder;
    }
  }

  async getAllOrders(): Promise<IOrder[]> {
    const token = await this.localDataSource.getToken();
    const offlineOrders = await this.localDataSource.getOfflineOrders();

    if (!token) {
      return offlineOrders;
    }

    try {
      const onlineOrders = await this.remoteDataSource.getAllOrders(token);
      return [...offlineOrders, ...onlineOrders];
    } catch (err) {
      return offlineOrders;
    }
  }

  async getSalesSummary(startDate?: string, endDate?: string): Promise<ISalesSummary> {
    const token = await this.localDataSource.getToken();
    const offlineOrders = await this.localDataSource.getOfflineOrders();

    if (!token) {
      return this.calculateMockSummary(offlineOrders);
    }

    try {
      return await this.remoteDataSource.getSalesSummary(token, startDate, endDate);
    } catch (err) {
      return this.calculateMockSummary(offlineOrders);
    }
  }

  async syncOfflineOrders(orders?: IOrder[]): Promise<number> {
    const token = await this.localDataSource.getToken();
    if (!token) return 0;

    const offlineOrders = orders || await this.localDataSource.getOfflineOrders();
    if (offlineOrders.length === 0) return 0;

    try {
      const response = await this.remoteDataSource.syncOfflineOrders(offlineOrders, token);
      if (response.success) {
        if (!orders) {
          await this.localDataSource.clearOfflineOrders();
        }
        return response.synchronizedCount;
      }
      return 0;
    } catch (err) {
      console.error('Offline synchronization failed:', err);
      return 0;
    }
  }

  private calculateMockSummary(orders: IOrder[]): ISalesSummary {
    const salesByCategory = {
      Sprite: 0,
      Coke: 0,
      Burger: 0,
      Pizza: 0,
      IceCream: 0,
      Chips: 0,
    };

    let totalRevenue = 0;
    orders.forEach(o => {
      totalRevenue += o.totalAmount;
      if (salesByCategory[o.category] !== undefined) {
        salesByCategory[o.category] += o.totalAmount;
      }
    });

    return {
      totalRevenue,
      totalOrders: orders.length,
      salesByCategory,
    };
  }
}
