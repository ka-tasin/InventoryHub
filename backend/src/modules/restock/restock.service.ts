import { restockRepository } from './restock.repository';

export const restockService = {
  async getRestockQueue() {
    return restockRepository.getRestockQueue();
  },

  async restockProduct(productId: string, quantity: number, userId?: string, notes?: string) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    return restockRepository.restockProduct(productId, quantity, userId, notes);
  },

  async removeFromQueue(productId: string, userId?: string) {
    return restockRepository.removeFromQueue(productId, userId);
  },

  async getRestockStats() {
    return restockRepository.getRestockStats();
  },
};