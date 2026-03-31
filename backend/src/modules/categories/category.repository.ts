import { PrismaClient } from '@prisma/client';
import { CreateCategoryInput, UpdateCategoryInput } from './category.types';

const prisma = new PrismaClient();

export const categoryRepository = {
  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  async getAll() {
    return prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true }
        }
      }
    });
  },

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } }
      }
    });
  },

  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  },

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
};