import { IAuthRepository } from '../repositories/IAuthRepository';
import { ICashier } from '../../types';

export class LoginCashier {
  constructor(private authRepository: IAuthRepository) {}

  async execute(username: string, password: string): Promise<{ token: string; cashier: ICashier }> {
    if (!username.trim() || !password.trim()) {
      throw new Error('Username and password are required.');
    }
    return this.authRepository.login(username.trim().toLowerCase(), password);
  }
}
