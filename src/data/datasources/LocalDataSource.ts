import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ICashier, IOrder } from '../../types';

export class LocalDataSource {
  private TOKEN_KEY = 'cashier_token';
  private CASHIER_KEY = 'cashier_profile';
  private OFFLINE_ORDERS_KEY = 'offline_orders_queue';

  private isWeb = Platform.OS === 'web';

  async saveToken(token: string): Promise<void> {
    if (this.isWeb) {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    }
  }

  async getToken(): Promise<string | null> {
    if (this.isWeb) {
      return AsyncStorage.getItem(this.TOKEN_KEY);
    } else {
      try {
        return await SecureStore.getItemAsync(this.TOKEN_KEY);
      } catch {
        return null;
      }
    }
  }

  async deleteToken(): Promise<void> {
    if (this.isWeb) {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    } else {
      try {
        await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      } catch {}
    }
  }

  async saveCashier(cashier: ICashier): Promise<void> {
    await AsyncStorage.setItem(this.CASHIER_KEY, JSON.stringify(cashier));
  }

  async getCashier(): Promise<ICashier | null> {
    const data = await AsyncStorage.getItem(this.CASHIER_KEY);
    return data ? JSON.parse(data) : null;
  }

  async deleteCashier(): Promise<void> {
    await AsyncStorage.removeItem(this.CASHIER_KEY);
  }

  async getOfflineOrders(): Promise<IOrder[]> {
    const data = await AsyncStorage.getItem(this.OFFLINE_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async saveOfflineOrders(orders: IOrder[]): Promise<void> {
    await AsyncStorage.setItem(this.OFFLINE_ORDERS_KEY, JSON.stringify(orders));
  }

  async addOfflineOrder(order: IOrder): Promise<void> {
    const orders = await this.getOfflineOrders();
    orders.push(order);
    await this.saveOfflineOrders(orders);
  }

  async clearOfflineOrders(): Promise<void> {
    await AsyncStorage.removeItem(this.OFFLINE_ORDERS_KEY);
  }
}
