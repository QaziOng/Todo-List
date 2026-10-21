import {
  createTaskById,
  deleteTaskById,
  getTasksByUserId,
  updateTaskById,
} from "../services/task.services.js";
import AppError from "../utils/app-error.js";

export async function getAllTask(req, res, next) {
  try {
    const tasks = await getTasksByUserId(req.user.id);

    if (!tasks) {
      throw new AppError("No task found", 404);
    }

    return res.status(200).json({
      message: "Tasks Found",
      tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, image_url } = req.validatedBody;
    const task = await createTaskById(
      req.user.id,
      title,
      description,
      image_url,
    );

    if (!task) {
      throw new AppError("Invalid User or Missing Title for a Task", 401);
    }

    return res.status(201).json({
      message: "Task created Successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { title, description, image_url, completed } = req.validatedBody;
    const task = await updateTaskById(
      req.params.id,
      req.user.id,
      title,
      description,
      image_url,
      completed,
    );

    if (!task) {
      throw new AppError("Invalid User or Missing Title for a Task", 401);
    }

    return res.status(201).json({
      message: "Task updated Successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await deleteTaskById(req.params.id, req.user.id);

    if (!task) {
      throw new AppError("Invalid User", 401);
    }

    return res.status(201).json({
      message: "Task Deleted Successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}
