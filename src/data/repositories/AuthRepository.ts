import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { RemoteDataSource } from '../datasources/RemoteDataSource';
import { LocalDataSource } from '../datasources/LocalDataSource';
import { ICashier } from '../../types';

export class AuthRepository implements IAuthRepository {
  constructor(
    private remoteDataSource: RemoteDataSource,
    private localDataSource: LocalDataSource
  ) {}

  async login(username: string, password: string): Promise<{ token: string; cashier: ICashier }> {
    const data = await this.remoteDataSource.login(username, password);
    await this.localDataSource.saveToken(data.token);
    await this.localDataSource.saveCashier(data.cashier);
    return data;
  }

  async logout(): Promise<void> {
    await this.localDataSource.deleteToken();
    await this.localDataSource.deleteCashier();
  }

  async getCurrentCashier(): Promise<ICashier | null> {
    return this.localDataSource.getCashier();
  }

  async getStoredToken(): Promise<string | null> {
    return this.localDataSource.getToken();
  }
}
