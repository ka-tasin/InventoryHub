import { Request, Response } from 'express';
import { productService } from './product.service';

export const productController = {
  async create(req: Request, res: Response) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const { status, categoryId, minStock, search } = req.query;
      const filters = {
        status: status as any,
        categoryId: categoryId as string,
        minStock: minStock === 'true',
        search: search as string,
      };
      const products = await productService.getAllProducts(filters);
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateStock(req: Request, res: Response) {
    try {
      const { quantity, type, reference, notes } = req.body;
      const product = await productService.updateStock(
        req.params.id,
        quantity,
        type,
        reference,
        notes
      );
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getLowStock(req: Request, res: Response) {
    try {
      const products = await productService.getLowStockProducts();
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStockStats(req: Request, res: Response) {
    try {
      const stats = await productService.getStockStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};