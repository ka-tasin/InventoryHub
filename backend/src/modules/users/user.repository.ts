import { PrismaClient } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from './user.types';

const prisma = new PrismaClient();

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ 
      where: { id },
      select: { id: true, email: true, name: true, role: true, isDemo: true, createdAt: true }
    });
  },

  async create(data: CreateUserInput) {
    return prisma.user.create({
      data,
      select: { id: true, email: true, name: true, role: true, isDemo: true }
    });
  },

  async getAll() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isDemo: true, createdAt: true }
    });
  },

  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true }
    });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
};