import { ICashier, IOrder, ISalesSummary } from '../../types';

export class RemoteDataSource {
  private baseUrl = 'https://project-55lvo.vercel.app/api'; // Live Vercel API backend

  constructor(customBaseUrl?: string) {
    if (customBaseUrl) {
      this.baseUrl = customBaseUrl;
    }
  }

  private async request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API error occurred.');
      }
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Network connection failed.');
    }
  }

  async login(username: string, password: string): Promise<{ token: string; cashier: ICashier }> {
    return this.request<{ token: string; cashier: ICashier }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async placeOrder(order: Omit<IOrder, 'cashier'>, token: string): Promise<IOrder> {
    const response = await this.request<{ success: boolean; data: IOrder }>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }, token);
    return response.data;
  }

  async getAllOrders(token: string): Promise<IOrder[]> {
    const response = await this.request<{ success: boolean; data: IOrder[] }>('/orders', {
      method: 'GET',
    }, token);
    return response.data;
  }

  async getSalesSummary(token: string, startDate?: string, endDate?: string): Promise<ISalesSummary> {
    let path = '/orders/reports/sales';
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length > 0) path += `?${params.join('&')}`;

    const response = await this.request<{ success: boolean; data: ISalesSummary }>(path, {
      method: 'GET',
    }, token);
    return response.data;
  }

  async syncOfflineOrders(orders: IOrder[], token: string): Promise<{ success: boolean; synchronizedCount: number }> {
    return this.request<{ success: boolean; synchronizedCount: number }>('/orders/sync', {
      method: 'POST',
      body: JSON.stringify({ orders }),
    }, token);
  }
}
