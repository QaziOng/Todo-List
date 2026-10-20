import {
  createTaskById,
  deleteTaskById,
  updateTaskById,
} from "../services/task.services";
import AppError from "../utils/app-error";

export async function createTask(req, res, next) {
  try {
    const { user_id, title, description, image_url } = req.validateBody;
    const task = await createTaskById(user_id, title, description, image_url);

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
    const { id, user_id, title, description, image_url, completed } =
      req.validateBody;
    const task = await updateTaskById(
      id,
      user_id,
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
    const { id, user_id } = await req.validateBody;
    const task = await deleteTaskById(id, user_id);

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
