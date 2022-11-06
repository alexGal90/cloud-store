import { Router } from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import fileController from '../controllers/fileController.js';

const fileRouter = new Router();

fileRouter.post('', authMiddleware, fileController.createDirectory);
fileRouter.get('', authMiddleware, fileController.getFiles);

export default fileRouter;
