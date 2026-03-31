import { Request, Response } from 'express';
import { orderService } from './order.service';

export const orderController = {
  async create(req: Request, res: Response) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new Error('Request body is empty. Make sure to send JSON data with Content-Type: application/json');
      }
      
      const customerName = req.body.customerName || req.body.customer_name || req.body.customer;
      
      if (!customerName) {
        throw new Error('Customer name is required. Please provide "customerName" field in the request body.');
      }
      
      const userId = (req as any).user?.id;
      console.log('User ID:', userId);
      
      // Prepare the data with the correct structure
      const orderData = {
        customerName: customerName,
        items: req.body.items || req.body.orderItems || []
      };
      
      console.log('Processed order data:', JSON.stringify(orderData, null, 2));
      
      const order = await orderService.createOrder(orderData, userId);
    
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      console.error('Error creating order:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const { status, startDate, endDate, search } = req.query;
      const filters = {
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
      };
      const orders = await orderService.getAllOrders(filters);
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const order = await orderService.updateOrder(req.params.id, req.body, userId);
      res.json({
        success: true,
        message: 'Order updated successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const order = await orderService.cancelOrder(req.params.id, userId);
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await orderService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getRecentActivity(req: Request, res: Response) {
    try {
      const activities = await orderService.getRecentActivity();
      res.json({ success: true, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};