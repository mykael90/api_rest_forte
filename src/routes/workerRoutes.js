import { Router } from 'express';
import WorkersContactController from '../controllers/WorkersContactController';
import WorkersController from '../controllers/WorkersController';
import ContactTypesController from '../controllers/ContactTypesController';

const router = new Router();
const inRoutes = new Router();

router.use('/', inRoutes);

router.get('/', WorkersController.index);
router.post('/', WorkersController.store);

inRoutes.get('/contacttypes', ContactTypesController.index);

export default router;
