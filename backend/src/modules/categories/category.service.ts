import { categoryRepository } from './category.repository';

export const categoryService = {
  async createCategory(data: { name: string }) {
    // Check if category with same name already exists
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new Error("Category with this name already exists");
    }

    return categoryRepository.create(data);
  },

  async getAllCategories() {
    return categoryRepository.getAll();
  },

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  },

  async updateCategory(id: string, data: { name?: string }) {
    // If name is being updated, check for duplicate
    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error("Category with this name already exists");
      }
    }
    return categoryRepository.update(id, data);
  },

  async deleteCategory(id: string) {
    // Optional: You can add check if category has products
    return categoryRepository.delete(id);
  }
};