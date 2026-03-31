import { orderRepository } from './order.repository';
import { productRepository } from '../products/product.repository';
import { CreateOrderInput, UpdateOrderInput, OrderFilters } from './order.types';
import { OrderStatus } from '@prisma/client';

export const orderService = {
  async createOrder(data: CreateOrderInput, userId?: string) {
    // Validate customer name
    if (!data.customerName || data.customerName.trim() === '') {
      throw new Error('Customer name is required');
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Check for duplicate products
    const productIds = data.items.map(item => item.productId);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      throw new Error('Duplicate products found in order. Please combine quantities for the same product.');
    }

    // Validate quantities
    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
    }

    return orderRepository.create(data, userId);
  },

  async getAllOrders(filters?: OrderFilters) {
    return orderRepository.getAll(filters);
  },

  async getOrderById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async updateOrder(id: string, data: UpdateOrderInput, userId?: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error('Order not found');

    // Prevent updating cancelled orders
    if (order.status === 'CANCELLED' && data.status !== 'CANCELLED') {
      throw new Error('Cannot update a cancelled order');
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (data.status && !validTransitions[order.status].includes(data.status)) {
      throw new Error(`Cannot change order status from ${order.status} to ${data.status}`);
    }

    return orderRepository.update(id, data, userId);
  },

  async cancelOrder(id: string, userId?: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error('Order not found');

    if (order.status === 'CANCELLED') {
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'DELIVERED') {
      throw new Error('Cannot cancel a delivered order');
    }

    return orderRepository.update(id, { status: 'CANCELLED' }, userId);
  },

  async getDashboardStats() {
    return orderRepository.getDashboardStats();
  },

  async getRecentActivity() {
    return orderRepository.getRecentActivity();
  },
};