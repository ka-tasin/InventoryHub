import { Router } from 'express';
import { restockController } from './restock.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/queue', restockController.getRestockQueue);
router.get('/stats', restockController.getRestockStats);
router.post('/:productId/restock', restockController.restockProduct);
router.delete('/:productId/queue', restockController.removeFromQueue);

export default router;