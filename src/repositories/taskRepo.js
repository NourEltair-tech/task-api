import prisma from '../config/db.js';

/**
 * Creates a new task record in the database.
 * @param {Object} taskData
 * @returns {Promise<Object>} The created task record.
 */
export async function create(taskData) {
  return await prisma.task.create({
    data: taskData
  });
}

/**
 * Retrieves all task records from the database.
 * @returns {Promise<Array>} List of all tasks.
 */
export async function findAll() {
  return await prisma.task.findMany();
}

/**
 * Retrieves all task records associated with a specific user ID.
 * @param {number} userId - The user ID.
 * @param {boolean|undefined} completed - Optional status filter.
 * @returns {Promise<Array>} List of tasks for the specified user.
 */
export async function findByUserId(userId, completed) {
  return await prisma.task.findMany({
    where: {
      userId: Number(userId),
      ...(completed === undefined ? {} : { completed })
    }
  });
}

/**
 * Finds a single task record by its unique primary key.
 * @param {number} id - The task ID.
 * @returns {Promise<Object|null>} The task record or null if not found.
 */
export async function findById(id) {
  return await prisma.task.findUnique({
    where: {
      id: Number(id)
    }
  });
}

/**
 * Updates an existing task record by its unique primary key.
 * @param {number} id - The task ID.
 * @param {Object} updatedData
 * @returns {Promise<Object|null>} The updated task record or null if not found.
 */
export async function updateById(id, updatedData) {
  return await prisma.task.update({
    where: {
      id: Number(id)
    },
    data: updatedData
  });
}

/**
 * Deletes a task record by its unique primary key.
 * @param {number} id - The task ID.
 * @returns {Promise<Object|null>} The deleted task record or null if not found.
 */
export async function deleteById(id) {
  return await prisma.task.delete({
    where: {
      id: Number(id)
    }
  });
}
