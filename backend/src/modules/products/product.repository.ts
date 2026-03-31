import { PrismaClient, TransactionType, Priority } from '@prisma/client';
import { CreateProductInput, UpdateProductInput, ProductFilters } from './product.types';

const prisma = new PrismaClient();

export const productRepository = {
  async create(data: CreateProductInput) {
    // Determine status based on stock
    const status = data.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK';
    
    return prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        minThreshold: data.minThreshold || 5,
        status,
        categoryId: data.categoryId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        minThreshold: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getAll(filters?: ProductFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.minStock) {
      where.stock = {
        lte: prisma.product.fields.minThreshold,
      };
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        minThreshold: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        minThreshold: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          take: 5,
          orderBy: { order: { createdAt: 'desc' } },
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            orderId: true,
            order: {
              select: {
                orderNumber: true,
                createdAt: true,
              },
            },
          },
        },
        stockTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            quantity: true,
            notes: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return product;
  },

  async findByName(name: string) {
    return prisma.product.findFirst({
      where: { name },
    });
  },

  async update(id: string, data: UpdateProductInput) {
    // Auto-update status based on stock if stock is being updated
    const updateData: any = { ...data };
    
    if (data.stock !== undefined) {
      updateData.status = data.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK';
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        minThreshold: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedAt: true,
      },
    });
  },

  async updateStock(id: string, quantity: number, type: TransactionType, orderId?: string, userId?: string, notes?: string) {
    // Use transaction to update stock and create transaction record
    return prisma.$transaction(async (tx) => {
      // Get current product to calculate previous stock
      const currentProduct = await tx.product.findUnique({
        where: { id },
        select: { stock: true, minThreshold: true },
      });

      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const previousStock = currentProduct.stock;
      const newStock = previousStock + quantity;

      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      const product = await tx.product.update({
        where: { id },
        data: {
          stock: newStock,
          status: newStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
        },
      });

      // Create stock transaction record
      await tx.stockTransaction.create({
        data: {
          productId: id,
          type,
          quantity: Math.abs(quantity),
          previousStock,
          newStock,
          orderId,
          userId,
          notes,
        },
      });

      // Check if product needs to be restocked (stock <= minThreshold)
      if (newStock <= currentProduct.minThreshold && newStock > 0) {
        await tx.restockQueue.upsert({
          where: { productId: id },
          update: {
            priority: newStock === 0 ? Priority.HIGH : Priority.MEDIUM,
          },
          create: {
            productId: id,
            priority: newStock === 0 ? Priority.HIGH : Priority.MEDIUM,
          },
        });
      } else if (newStock > currentProduct.minThreshold) {
        // If stock is above threshold, remove from restock queue if exists
        await tx.restockQueue.deleteMany({
          where: { productId: id },
        });
      }

      return product;
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  async getLowStockProducts() {
    return prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        stock: {
          lte: prisma.product.fields.minThreshold,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minThreshold: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async getStockStats() {
    const products = await prisma.product.findMany({
      select: {
        stock: true,
        minThreshold: true,
        status: true,
      },
    });

    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;
    const lowStock = products.filter(p => p.stock <= p.minThreshold && p.status === 'ACTIVE').length;
    const totalStockValue = products.reduce((sum, p) => sum + p.stock, 0);

    return {
      totalProducts,
      outOfStock,
      lowStock,
      totalStockValue,
    };
  },
};