import { ICashier } from '../../types';

export interface IAuthRepository {
  login(username: string, password: string): Promise<{ token: string; cashier: ICashier }>;
  logout(): Promise<void>;
  getCurrentCashier(): Promise<ICashier | null>;
  getStoredToken(): Promise<string | null>;
}
