import Task from "../models/task.model";
import TaskRepository from "../repositories/task.repository.js";
import { findUserById } from "../repositories/user.repository.js";

const TaskRepo = new TaskRepository();

// Create Task by UserID
export async function createTaskById(user_id, title, description, image_url) {
  if (!user_id || !title) {
    return null;
  }

  const checkUser = await findUserById(user_id);

  if (!checkUser) {
    return null;
  }

  const newTask = await TaskRepo.createTask({
    user_id,
    title,
    description,
    image_url,
  });

  return newTask;
}

// Update Tasks by ID
export async function updateTaskById(
  id,
  user_id,
  title,
  description,
  image_url,
  completed,
) {
  if (!user_id || !title) {
    return null;
  }

  const checkUser = await findUserById(user_id);

  if (!checkUser) {
    return null;
  }

  const updatedTask = await TaskRepo.updateTask({
    id,
    user_id,
    title,
    description,
    image_url,
    completed,
  });

  return updatedTask;
}

// Delete Tasks by ID
export async function deleteTaskById(id, user_id) {
  if (!user_id) {
    return null;
  }

  const checkUser = await findUserById(user_id);

  if (!checkUser) {
    return null;
  }

  const deleteTask = await TaskRepo.deleteTask({ id, user_id });

  return deleteTask;
}
