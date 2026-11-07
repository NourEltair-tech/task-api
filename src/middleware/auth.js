import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import * as taskRepo from '../repositories/taskRepo.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({"error":"Unauthorized"});

  }
  
  const token = authHeader.split(' ')[1];

  if (!token){
    return res.status(401).json({ error: 'Unauthorized'});
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch (error) {
    return res.status(401).json({ error: 'Unauthorized'});
  }
}

export async function requireTaskOwnership(req, res, next) {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <=0) {
    return res.status(400).json({ error: 'Invalid task ID'});
  }
  
  try{
    const task = await taskRepo.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'ADMIN' &&
      task.userId !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Forbidden'});
      }

    req.task = task;
    next();
  } catch (error) {
    next(error);
  }
}


export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN'){
    return res.status(403).json({ error: 'Forbidden'});
  }
next();
}
