import express from 'express';

import { createBlock, deleteBlock, getBlocks } from '../controllers/blockController.js';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getBlocks);
router.post('/', protect, adminOnly, createBlock);
router.delete('/:id', protect, adminOnly, deleteBlock);

export default router;
