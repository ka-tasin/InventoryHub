import { PrismaClient, Priority } from '@prisma/client';

const prisma = new PrismaClient();

export const restockRepository = {
  async getRestockQueue() {
    // Get all products in restock queue with their details
    const queue = await prisma.restockQueue.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' }, // HIGH, MEDIUM, LOW
        { product: { stock: 'asc' } }, // Lowest stock first
      ],
    });

    // Transform to include stock information
    return queue.map(item => ({
      id: item.id,
      productId: item.productId,
      priority: item.priority,
      addedAt: item.addedAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        stock: item.product.stock,
        minThreshold: item.product.minThreshold,
        category: item.product.category,
        stockStatus: item.product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      },
    }));
  },

  async restockProduct(productId: string, quantity: number, userId?: string, notes?: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stock: true, minThreshold: true, name: true },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          status: newStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
        },
      });

      // Create stock transaction
      await tx.stockTransaction.create({
        data: {
          productId,
          type: 'RESTOCK',
          quantity,
          previousStock,
          newStock,
          userId,
          notes: notes || `Manual restock`,
        },
      });

      // Remove from restock queue if stock is above threshold
      if (newStock > product.minThreshold) {
        await tx.restockQueue.deleteMany({
          where: { productId },
        });
      } else if (newStock <= product.minThreshold && newStock > 0) {
        // Update priority if still below threshold
        await tx.restockQueue.update({
          where: { productId },
          data: {
            priority: newStock === 0 ? Priority.HIGH : Priority.MEDIUM,
          },
        });
      }

      // Create activity log
      await tx.activityLog.create({
        data: {
          action: 'PRODUCT_RESTOCKED',
          details: `Restocked ${quantity} units of "${product.name}". New stock: ${newStock}`,
          productId,
          userId,
        },
      });

      return updatedProduct;
    });
  },

  async removeFromQueue(productId: string, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    await prisma.restockQueue.deleteMany({
      where: { productId },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: 'REMOVED_FROM_RESTOCK_QUEUE',
        details: `Product "${product.name}" removed from restock queue`,
        productId,
        userId,
      },
    });

    return { success: true, message: 'Product removed from restock queue' };
  },

  async getRestockStats() {
    const queue = await prisma.restockQueue.findMany({
      include: {
        product: {
          select: {
            stock: true,
            minThreshold: true,
          },
        },
      },
    });

    const highPriority = queue.filter(item => item.priority === 'HIGH').length;
    const mediumPriority = queue.filter(item => item.priority === 'MEDIUM').length;
    const lowPriority = queue.filter(item => item.priority === 'LOW').length;

    return {
      totalItems: queue.length,
      highPriority,
      mediumPriority,
      lowPriority,
      items: queue.map(item => ({
        productId: item.productId,
        stock: item.product.stock,
        threshold: item.product.minThreshold,
        deficit: item.product.minThreshold - item.product.stock,
      })),
    };
  },
};