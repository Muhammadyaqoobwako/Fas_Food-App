import { IOrderRepository } from '../repositories/IOrderRepository';
import { IOrder, IOrderItem } from '../../types';

export class PlaceOrder {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    category: IOrder['category'],
    items: IOrderItem[],
    customerName?: string,
    deliveryAddress?: string
  ): Promise<IOrder> {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // Validate billing math: ensure multiplication, not addition (fixes legacy Chips bug)
    let calculatedTotal = 0;
    const validatedItems = items.map(item => {
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than 0.');
      }
      if (item.unitPrice < 0) {
        throw new Error('Item unit price cannot be negative.');
      }
      
      // Enforce multiplication, not addition
      const itemTotal = Number(item.quantity) * Number(item.unitPrice);
      calculatedTotal += itemTotal;
      
      return {
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      };
    });

    const orderPayload: Omit<IOrder, 'cashier'> = {
      category,
      items: validatedItems,
      totalAmount: calculatedTotal,
      customerName,
      deliveryAddress,
      status: 'pending', // Default status for online/table orders
    };

    return this.orderRepository.placeOrder(orderPayload);
  }
}
