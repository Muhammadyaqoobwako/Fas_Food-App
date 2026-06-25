import { ICashier, IOrder, ISalesSummary, UserRole, IMenuItem } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class RemoteDataSource {
  private baseUrl = 'https://project-55lvo.vercel.app/api'; // Live Vercel API server

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

  // Mock users database for local/demo authentication
  private mockUsers: Record<string, { token: string; cashier: ICashier }> = {
    customer: {
      token: 'mock-customer-token',
      cashier: {
        id: 'cust-1',
        username: 'Customer',
        role: 'customer',
        email: 'customer@fasfood.co.za',
        joinedAt: '2025-01-15T00:00:00Z',
      },
    },
    manager: {
      token: 'mock-manager-token',
      cashier: {
        id: 'mgr-1',
        username: 'Manager',
        role: 'manager',
        email: 'manager@fasfood.co.za',
        joinedAt: '2024-06-01T00:00:00Z',
      },
    },
    driver: {
      token: 'mock-driver-token',
      cashier: {
        id: 'drv-1',
        username: 'Driver',
        role: 'driver',
        email: 'driver@fasfood.co.za',
        joinedAt: '2025-03-10T00:00:00Z',
      },
    },
    guest: {
      token: 'mock-guest-token',
      cashier: {
        id: 'guest-1',
        username: 'Guest',
        role: 'customer',
        email: '',
        joinedAt: new Date().toISOString(),
      },
    },
    owner: {
      token: 'mock-owner-token',
      cashier: {
        id: 'own-1',
        username: 'Owner',
        role: 'owner',
        email: 'owner@fasfood.co.za',
        joinedAt: '2025-02-28T00:00:00Z',
        restaurantName: 'Fas Food Palace',
      },
    },
  };

  private async loadMockUsers(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('store_mock_users_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.mockUsers = {
          ...this.mockUsers,
          ...parsed,
        };
      }
    } catch (err) {
      console.error('Failed to load mock users:', err);
    }
  }

  private async saveMockUsers(additionalUsers: Record<string, any>): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('store_mock_users_v1');
      const currentSaved = saved ? JSON.parse(saved) : {};
      const updated = {
        ...currentSaved,
        ...additionalUsers,
      };
      await AsyncStorage.setItem('store_mock_users_v1', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save mock users:', err);
    }
  }

  async login(username: string, password: string): Promise<{ token: string; cashier: ICashier }> {
    // For default/built-in mock users, return them immediately
    const builtInMocks = ['customer', 'manager', 'driver', 'guest', 'owner'];
    if (builtInMocks.includes(username.toLowerCase())) {
      await this.loadMockUsers();
      const mockUser = this.mockUsers[username.toLowerCase()];
      if (mockUser) return mockUser;
    }

    try {
      return await this.request<{ token: string; cashier: ICashier }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    } catch (err: any) {
      console.warn('Login API failed, checking local mock users:', err.message);
      await this.loadMockUsers();
      const mockUser = this.mockUsers[username.toLowerCase()];
      if (mockUser) {
        return mockUser;
      }
      throw err;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err: any) {
      await this.loadMockUsers();
      const userExists = Object.values(this.mockUsers).some(u => u.cashier.email?.toLowerCase() === email.toLowerCase());
      const presetEmails = ['customer@fasfood.co.za', 'manager@fasfood.co.za', 'driver@fasfood.co.za', 'owner@fasfood.co.za'];
      const isPreset = presetEmails.includes(email.toLowerCase());

      if (!userExists && !isPreset) {
        throw new Error('No account registered with this email address.');
      }

      const mockOtp = '123456';
      await AsyncStorage.setItem('mock_reset_otp', JSON.stringify({ email: email.toLowerCase(), otp: mockOtp, expires: Date.now() + 10 * 60 * 1000 }));
      
      if (typeof alert !== 'undefined') {
        alert(`[DEMO MODE] Reset OTP code sent to your email is: ${mockOtp}`);
      } else {
        console.log(`[DEMO MODE] OTP for ${email}: ${mockOtp}`);
      }

      return { message: 'OTP sent successfully to registered email (Mock Mode).' };
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
    } catch (err: any) {
      const cachedOtpStr = await AsyncStorage.getItem('mock_reset_otp');
      if (!cachedOtpStr) {
        throw new Error('Invalid or expired OTP.');
      }
      const cached = JSON.parse(cachedOtpStr);
      if (cached.email !== email.toLowerCase() || cached.otp !== otp) {
        throw new Error('Invalid OTP code.');
      }
      if (cached.expires < Date.now()) {
        throw new Error('OTP code has expired.');
      }

      await this.loadMockUsers();
      await AsyncStorage.removeItem('mock_reset_otp');
      return { message: 'Password has been reset successfully (Mock Mode).' };
    }
  }

  async register(
    fullName: string,
    email: string,
    username: string,
    password: string,
    role: UserRole = 'customer',
    restaurantName?: string
  ): Promise<{ token: string; cashier: ICashier }> {
    try {
      const response = await this.request<{ success: boolean; data: { token: string; cashier: ICashier } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          role,
          restaurantName,
          email
        }),
      });
      if (response && response.data) {
        return response.data;
      }
      throw new Error('Invalid response from server.');
    } catch (err: any) {
      console.warn('Registration API failed, falling back to mock mode:', err.message);
      await this.loadMockUsers();
      // Store as a new mock user for the session
      const newUser = {
        token: `mock-${username}-token-${Date.now()}`,
        cashier: {
          id: `user-${Date.now()}`,
          username: fullName || username,
          role,
          email,
          joinedAt: new Date().toISOString(),
          restaurantName,
        },
      };
      this.mockUsers[username.toLowerCase()] = newUser;
      await this.saveMockUsers({ [username.toLowerCase()]: newUser });
      return newUser;
    }
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

  async getMenuItems(): Promise<IMenuItem[]> {
    const response = await this.request<{ success: boolean; data: IMenuItem[] }>('/menu', {
      method: 'GET',
    });
    return response.data;
  }

  async createMenuItem(item: Omit<IMenuItem, '_id'>, token: string): Promise<IMenuItem> {
    const response = await this.request<{ success: boolean; data: IMenuItem }>('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    }, token);
    return response.data;
  }

  async deleteMenuItem(id: string, token: string): Promise<void> {
    await this.request<{ success: boolean }>('/menu/' + id, {
      method: 'DELETE',
    }, token);
  }

  async updateOrder(id: string, updates: Partial<IOrder>, token: string): Promise<IOrder> {
    const response = await this.request<{ success: boolean; data: IOrder }>('/orders/' + id, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, token);
    return response.data;
  }
}
