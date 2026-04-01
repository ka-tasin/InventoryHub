import { PrismaClient, OrderStatus } from '@prisma/client';
import { CreateOrderInput, UpdateOrderInput, OrderFilters } from './order.types';

const prisma = new PrismaClient();

export const orderRepository = {
  async create(data: CreateOrderInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // Calculate total price and validate products
      let totalPrice = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true, stock: true, status: true, name: true },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.status === 'OUT_OF_STOCK') {
          throw new Error(`Product "${product.name}" is out of stock`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} units available.`);
        }

        const subtotal = product.price * item.quantity;
        totalPrice += subtotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customerName: data.customerName,
          totalPrice,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Update stock and create stock transactions
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, minThreshold: true },
        });

        if (!product) continue;

        const newStock = product.stock - item.quantity;

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: newStock,
            status: newStock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
          },
        });

        // Create stock transaction
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            type: 'DEDUCT',
            quantity: item.quantity,
            previousStock: product.stock,
            newStock,
            orderId: order.id,
            userId,
            notes: `Order #${order.orderNumber}`,
          },
        });

        // Check if product needs to be added to restock queue
        if (newStock <= product.minThreshold && newStock > 0) {
          await tx.restockQueue.upsert({
            where: { productId: item.productId },
            update: {
              priority: newStock === 0 ? 'HIGH' : 'MEDIUM',
            },
            create: {
              productId: item.productId,
              priority: newStock === 0 ? 'HIGH' : 'MEDIUM',
            },
          });
        }
      }

      // Create activity log
      await tx.activityLog.create({
        data: {
          action: 'ORDER_CREATED',
          details: `Order #${order.orderNumber} created by user`,
          orderId: order.id,
          userId,
        },
      });

      return order;
    });
  },

  async getAll(filters?: OrderFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { customerName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        activityLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        stockTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
    });
  },

  async update(id: string, data: UpdateOrderInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // If order is cancelled, restore stock
      if (data.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        for (const item of existingOrder.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, minThreshold: true },
          });

          if (product) {
            const newStock = product.stock + item.quantity;

            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: newStock,
                status: newStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
              },
            });

            await tx.stockTransaction.create({
              data: {
                productId: item.productId,
                type: 'RESTOCK',
                quantity: item.quantity,
                previousStock: product.stock,
                newStock,
                orderId: id,
                userId,
                notes: `Order #${existingOrder.orderNumber} cancelled`,
              },
            });

            // Remove from restock queue if stock is above threshold
            if (newStock > product.minThreshold) {
              await tx.restockQueue.deleteMany({
                where: { productId: item.productId },
              });
            }
          }
        }
      }

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: data.status,
          customerName: data.customerName,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Create activity log
      const statusMessage = data.status ? `marked as ${data.status}` : 'updated';
      await tx.activityLog.create({
        data: {
          action: 'ORDER_UPDATED',
          details: `Order #${existingOrder.orderNumber} ${statusMessage}`,
          orderId: id,
          userId,
        },
      });

      return updatedOrder;
    });
  },

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, pendingOrders, completedOrders, deliveredOrders, revenueToday, totalRevenue, lowStockCount] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.order.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.order.count({
        where: {
          status: {
            in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'],
          },
        },
      }),
      prisma.order.count({
        where: {
          status: 'DELIVERED',
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.product.count({
        where: {
          status: 'ACTIVE',
          stock: {
            lte: prisma.product.fields.minThreshold,
          },
        },
      }),
    ]);

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
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
            name: true,
          },
        },
      },
      orderBy: {
        stock: 'asc',
      },
      take: 5,
    });

    return {
      totalOrdersToday: todayOrders,
      pendingOrders,
      completedOrders,
      deliveredOrders,
      revenueToday: revenueToday._sum.totalPrice || 0,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      lowStockCount,
      lowStockProducts: lowStockProducts.map(p => ({
        ...p,
        status: p.stock === 0 ? 'OUT_OF_STOCK' : p.stock <= p.minThreshold ? 'LOW_STOCK' : 'OK',
      })),
    };
  },

  async getRecentActivity() {
    return prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        order: {
          select: { orderNumber: true },
        },
        product: {
          select: { name: true },
        },
      },
    });
  },
};