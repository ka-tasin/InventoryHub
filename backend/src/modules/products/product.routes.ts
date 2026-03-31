import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);


router.post('/', productController.create);
router.get('/', productController.getAll);
router.get('/low-stock', productController.getLowStock);
router.get('/stats', productController.getStockStats);
router.get('/:id', productController.getById);
router.put('/:id', productController.update);
router.patch('/:id/stock', productController.updateStock);
router.delete('/:id', productController.delete);

export default router;