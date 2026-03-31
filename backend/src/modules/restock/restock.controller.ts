import { Request, Response } from 'express';
import { restockService } from './restock.service';

export const restockController = {
  async getRestockQueue(req: Request, res: Response) {
    try {
      const queue = await restockService.getRestockQueue();
      res.json({
        success: true,
        data: queue,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async restockProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { quantity, notes } = req.body;
      const userId = (req as any).user?.id;

      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be provided and greater than 0');
      }

      const product = await restockService.restockProduct(
        productId,
        quantity,
        userId,
        notes
      );

      res.json({
        success: true,
        message: 'Product restocked successfully',
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async removeFromQueue(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = (req as any).user?.id;

      await restockService.removeFromQueue(productId, userId);

      res.json({
        success: true,
        message: 'Product removed from restock queue',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getRestockStats(req: Request, res: Response) {
    try {
      const stats = await restockService.getRestockStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};