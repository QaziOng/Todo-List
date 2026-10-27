import TaskRepository from "../repositories/task.repository.js";
import { findUserById } from "../repositories/user.repository.js";

const TaskRepo = new TaskRepository();

// Find all Tasks by UserId
export async function getTasksByUserId(user_id) {
  const checkUser = await findUserById(user_id);
  if (!checkUser) {
    return null;
  }

  return await TaskRepo.findTasksByUserId(user_id);
}

export async function getTaskById(id, user_id) {
  return TaskRepo.findTaskById(id, user_id);
}

export async function isImageKeyUsed(image_key) {
  return (await TaskRepo.countTasksByImageKey(image_key)) > 0;
}

// Create Task by UserID
export async function createTaskById(
  user_id,
  title,
  description,
  image_key,
  completed = false,
) {
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
    image_key,
    completed,
  });

  return newTask;
}

// Update Tasks by ID
export async function updateTaskById(
  id,
  user_id,
  title,
  description,
  image_key,
  completed,
) {
  if (!id || !user_id || !title) {
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
    image_key,
    completed,
  });

  return updatedTask;
}

// Delete Tasks by ID
export async function deleteTaskById(id, user_id) {
  if (!id || !user_id) {
    return null;
  }

  const checkUser = await findUserById(user_id);

  if (!checkUser) {
    return null;
  }

  const deleteTask = await TaskRepo.deleteTask(id, user_id);

  return deleteTask;
}
