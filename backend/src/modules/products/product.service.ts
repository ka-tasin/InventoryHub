import { productRepository } from './product.repository';
import { categoryRepository } from '../categories/category.repository';
import { CreateProductInput, UpdateProductInput, ProductFilters } from './product.types';
import { TransactionType } from '@prisma/client';

export const productService = {
  async createProduct(data: CreateProductInput) {
    // Validate category exists
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if product with same name exists
    const existing = await productRepository.findByName(data.name);
    if (existing) {
      throw new Error('Product with this name already exists');
    }

    // Validate price
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Validate stock
    if (data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    // Validate minThreshold
    if (data.minThreshold && data.minThreshold < 0) {
      throw new Error('Minimum threshold cannot be negative');
    }

    return productRepository.create(data);
  },

  async getAllProducts(filters?: ProductFilters) {
    return productRepository.getAll(filters);
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');

    // If category is being updated, validate it exists
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    // If name is being updated, check for duplicate
    if (data.name) {
      const existing = await productRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error('Product with this name already exists');
      }
    }

    // Validate price if being updated
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Validate stock if being updated
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return productRepository.update(id, data);
  },

  async updateStock(id: string, quantity: number, type: TransactionType, orderId?: string, userId?: string, notes?: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');

    return productRepository.updateStock(id, quantity, type, orderId, userId, notes);
  },

  async deleteProduct(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');

    // Check if product has order items
    // Now _count is properly included in the select
    if (product._count && product._count.orderItems > 0) {
      throw new Error('Cannot delete product with existing orders');
    }

    return productRepository.delete(id);
  },

  async getLowStockProducts() {
    return productRepository.getLowStockProducts();
  },

  async getStockStats() {
    return productRepository.getStockStats();
  },
};