import { Router } from 'express';
import { orderController } from './order.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', orderController.create);
router.get('/', orderController.getAll);
router.get('/dashboard/stats', orderController.getDashboardStats);
router.get('/dashboard/activity', orderController.getRecentActivity);
router.get('/:id', orderController.getById);
router.put('/:id', orderController.update);
router.patch('/:id/cancel', orderController.cancel);

export default router;