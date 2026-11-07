import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateId, validateUpdateTask} from '../middleware/validators.js';

import {
    getAllTasksHandler,
    getTaskByIdHandler,
    updateTaskByIdHandler,
    deleteTaskByIdHandler
}   from '../controllers/taskController.js';

const router = express.Router();
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllTasksHandler);
router.get('/:id', validateId, getTaskByIdHandler);
router.put('/:id', validateId, validateUpdateTask, updateTaskByIdHandler);
router.delete('/:id', validateId, deleteTaskByIdHandler); 

export default router;
