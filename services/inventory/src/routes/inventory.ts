import { createInventory } from '@/controllers';
import { Router } from 'express';

const router = Router();

router.route('/').post(createInventory);

export default router;
