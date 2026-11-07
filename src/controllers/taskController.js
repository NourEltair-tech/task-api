import * as taskService from '../services/taskService.js';

/**
 * Handles creating a new task.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export async function createTaskHandler(req, res) {
  try {
    const taskData = {
      title: req.body.title,
      userId: Number(req.user.id)
    };

    const task = await taskService.createTask(taskData);

    return res.status(201).json(task);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }

}

/**
 * Handles retrieving all tasks across the system.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export async function getAllTasksHandler(req, res) {
  try {
    const tasks = await taskService.findAllTasks();

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }
}

/**
 * Handles retrieving tasks owned by the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export async function getMyTasksHandler(req, res) {
  try {
    const completed = req.query.completed === undefined
      ? undefined
      : req.query.completed === 'true';
    const tasks = await taskService.findTasksByUserId(req.user.id, completed);

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }
}

/**
 * Handles retrieving a specific task by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export async function getTaskByIdHandler(req, res) {
  try {
    const task = await taskService.findTaskById(Number(req.params.id));

    return res.status(200).json(task);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }
}

/**
 * Handles updating an existing task by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export async function updateTaskByIdHandler(req, res) {
  try {
    const updatedData = {};

    if (req.body.title !== undefined) {
      updatedData.title = req.body.title;
    }

    if (req.body.completed !== undefined) {
      updatedData.completed = req.body.completed;
    }

    const task = await taskService.updateTaskById(
      Number(req.params.id),
      updatedData
    );

    return res.status(200).json(task);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }
}

/**
 * Handles deleting an existing task by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export async function deleteTaskByIdHandler(req, res) {
  try {
    await taskService.deleteTaskById(Number(req.params.id));

    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }
}
