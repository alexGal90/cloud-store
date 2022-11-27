import { Router } from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import fileController from '../controllers/fileController.js';

const fileRouter = new Router();

fileRouter.post('', authMiddleware, fileController.createDirectory);
fileRouter.get('', authMiddleware, fileController.getFiles);
fileRouter.post('/upload-file', authMiddleware, fileController.uploadFile);
fileRouter.get('/download-file', authMiddleware, fileController.downloadFile);
fileRouter.delete('', authMiddleware, fileController.removeFile);
fileRouter.patch('/rename', authMiddleware, fileController.renameFile);

export default fileRouter;
