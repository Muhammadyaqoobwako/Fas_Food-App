const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface OrderItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
  servedWith?: string;
  colour?: string;
  flavour?: string;
  type?: string;
}

export interface PlaceOrderPayload {
  category: string;
  items: OrderItemPayload[];
  offlineCreatedAt?: string;
}

class ApiService {
  private async request(method: string, path: string, body?: any, token?: string | null) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();
      return { status: response.status, ok: response.ok, data };
    } catch (err) {
      console.error(`API Error on ${path}:`, err);
      throw err;
    }
  }

  async login(username: string, password: string) {
    const res = await this.request('POST', '/auth/login', { username, password });
    if (res.ok && res.data.success) {
      return {
        success: true,
        token: res.data.token,
        cashier: {
          username: (res.data.cashier && res.data.cashier.username) || username,
          role: (res.data.cashier && res.data.cashier.role) || 'cashier'
        }
      };
    }
    return { success: false, message: res.data.message || 'Authentication failed' };
  }

  async placeOrder(payload: PlaceOrderPayload, token: string | null) {
    const res = await this.request('POST', '/orders', payload, token);
    return res.ok && res.data.success;
  }

  async getOrders(token: string | null) {
    const res = await this.request('GET', '/orders', undefined, token);
    if (res.ok && res.data.success) {
      return res.data.data;
    }
    return [];
  }

  async getSalesReport(token: string | null) {
    const res = await this.request('GET', '/orders/reports/sales', undefined, token);
    if (res.ok && res.data.success) {
      return res.data.data;
    }
    return null;
  }

  async deleteOrder(id: string, token: string | null) {
    const res = await this.request('DELETE', `/orders/${id}`, undefined, token);
    return res.ok && res.data.success;
  }

  async getMenuItems(token: string | null) {
    const res = await this.request('GET', '/menu', undefined, token);
    if (res.ok && res.data.success) {
      return res.data.data;
    }
    return [];
  }

  async createMenuItem(payload: any, token: string | null) {
    const res = await this.request('POST', '/menu', payload, token);
    return res.ok ? res.data : { success: false, message: 'Failed to create menu item' };
  }

  async updateMenuItem(id: string, payload: any, token: string | null) {
    const res = await this.request('PUT', `/menu/${id}`, payload, token);
    return res.ok ? res.data : { success: false, message: 'Failed to update menu item' };
  }

  async deleteMenuItem(id: string, token: string | null) {
    const res = await this.request('DELETE', `/menu/${id}`, undefined, token);
    return res.ok && res.data.success;
  }
}

export default new ApiService();
