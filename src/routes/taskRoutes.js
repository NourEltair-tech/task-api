import express from 'express';
import { authenticate, requireTaskOwnership } from '../middleware/auth.js';

import {
    validateId,
    validateCreateTask,
    validateUpdateTask,
    validateCompletedFilter
}   from '../middleware/validators.js';

import {
    createTaskHandler,
    getMyTasksHandler,
    getTaskByIdHandler,
    updateTaskByIdHandler,
    deleteTaskByIdHandler
}   from '../controllers/taskController.js';
const router = express.Router();
router.use(authenticate);

router.get('/', validateCompletedFilter, getMyTasksHandler);
router.post('/', validateCreateTask, createTaskHandler);
router.get('/:id', validateId, requireTaskOwnership, getTaskByIdHandler);
router.put('/:id', validateId, validateUpdateTask, requireTaskOwnership, updateTaskByIdHandler);
router.delete('/:id', validateId, requireTaskOwnership, deleteTaskByIdHandler);


export default router;
