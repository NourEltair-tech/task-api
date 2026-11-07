import * as taskRepo from '../repositories/taskRepo.js';
/**
 * Creates a new task record.
 * @param {Object} taskData
 * @returns {Promise<Object>} The newly created task.
 */
export async function createTask(taskData) {
  return await taskRepo.create(taskData);
}

/**
 * Retrieves all tasks associated with a specific user.
 * @param {number} id - The user ID.
 * @param {boolean|undefined} completed - Optional status filter.
 * @returns {Promise<Array>} List of user tasks.
 */
export async function findTasksByUserId(userId, completed) {
  return await taskRepo.findByUserId(userId, completed);
}

/**
 * Retrieves all tasks across the system.
 * @returns {Promise<Array>} List of all tasks.
 */
export async function findAllTasks(completed) {
  return await taskRepo.findAll(completed);
}
}

/**
 * Retrieves a single task by its ID.
 * @param {number} id - The task ID.
 * @returns {Promise<Object>} The found task.
 * @throws {Error} Throws a 404 error if the task is not found.
 */
export async function findTaskById(id) {
  const task = await taskRepo.findById(id);

  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return task;

}


/**
 * Updates a task by its ID.
 * @param {number} id - The task ID.
 * @param {Object} updatedData
 * @returns {Promise<Object>} The updated task.
 * @throws {Error} Throws a 404 error if the task is not found.
 */
export async function updateTaskById(id, updatedData) {
  await findTaskById(id);

  return await taskRepo.updateById(id, updatedData);
}

/**
 * Deletes a task by its ID.
 * @param {number} id - The task ID.
 * @returns {Promise<void>} Resolves with no content when deletion is successful.
 * @throws {Error} Throws a 404 error if the task is not found.
 */
export async function deleteTaskById(id) {
  await findTaskById(id);

  await taskRepo.deleteById(id);
}
