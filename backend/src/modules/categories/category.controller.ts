import { Request, Response } from 'express';
import { categoryService } from './category.service';

export const categoryController = {
  async create(req: Request, res: Response) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.json({
        success: true,
        message: "Category updated successfully",
        data: category
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};