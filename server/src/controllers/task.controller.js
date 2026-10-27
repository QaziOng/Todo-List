import {
  createTaskById,
  deleteTaskById,
  getTaskById,
  getTasksByUserId,
  isImageKeyUsed,
  updateTaskById,
} from "../services/task.services.js";
import AppError from "../utils/app-error.js";
import {
  importRemoteImage,
  removeStoredImage,
} from "../services/image.services.js";

async function discardImage(filename) {
  if (!filename) return;

  try {
    await removeStoredImage(filename);
  } catch (error) {
    console.error("Could not remove unreferenced upload", error);
  }
}

async function discardImageIfUnused(filename) {
  if (!filename) return;

  try {
    if (!(await isImageKeyUsed(filename))) {
      await discardImage(filename);
    }
  } catch (error) {
    console.error(
      "Could not check whether an image is still referenced",
      error,
    );
  }
}

async function resolveIncomingImage(req) {
  const { imageUrl } = req.validatedBody;
  if (req.file && imageUrl) {
    throw new AppError("Send an uploaded image or imageUrl, not both.", 400);
  }
  if (req.file) {
    return { filename: req.file.filename };
  }
  if (imageUrl) {
    return importRemoteImage(imageUrl);
  }
  return null;
}

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
  let incomingImage;
  try {
    const { title, description, completed } = req.validatedBody;
    incomingImage = await resolveIncomingImage(req);
    const task = await createTaskById(
      req.user.id,
      title,
      description,
      incomingImage?.filename ?? null,
      completed,
    );

    if (!task) {
      throw new AppError("Could not create task.", 400);
    }

    return res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    await discardImage(incomingImage?.filename ?? req.file?.filename);
    next(error);
  }
}

export async function updateTask(req, res, next) {
  let incomingImage;
  let taskUpdated = false;
  try {
    const { title, description, completed } = req.validatedBody;
    const previousTask = await getTaskById(req.params.id, req.user.id);
    if (!previousTask) {
      throw new AppError("Task not found.", 404);
    }

    incomingImage = await resolveIncomingImage(req);
    const task = await updateTaskById(
      req.params.id,
      req.user.id,
      title,
      description,
      incomingImage?.filename,
      completed,
    );

    if (!task) {
      throw new AppError("Task could not be updated.", 404);
    }
    taskUpdated = true;

    if (
      incomingImage &&
      previousTask.image_key &&
      previousTask.image_key !== task.image_key
    ) {
      await discardImageIfUnused(previousTask.image_key);
    }

    return res.status(201).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    if (!taskUpdated) {
      await discardImage(incomingImage?.filename ?? req.file?.filename);
    }
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const taskBeforeDelete = await getTaskById(req.params.id, req.user.id);
    if (!taskBeforeDelete) {
      throw new AppError("Task not found.", 404);
    }

    const task = await deleteTaskById(req.params.id, req.user.id);

    if (!task) {
      throw new AppError("Task could not be deleted.", 404);
    }

    await discardImageIfUnused(taskBeforeDelete.image_key);

    return res.status(201).json({
      message: "Task Deleted Successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}
