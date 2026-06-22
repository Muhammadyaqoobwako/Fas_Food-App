import { IOrderRepository } from '../repositories/IOrderRepository';
import { ISalesSummary } from '../../types';

export class GetSalesSummary {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(startDate?: string, endDate?: string): Promise<ISalesSummary> {
    return this.orderRepository.getSalesSummary(startDate, endDate);
  }
}
