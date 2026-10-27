import Task from "../models/task.model.js";

export default class TaskRepository {
  // Get all Tasks by the userId
  async findTasksByUserId(user_id) {
    const tasks = await Task.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });
    return tasks;
  }

  // Create a New Task
  async createTask(taskData) {
    const task = await Task.create(taskData);
    return task;
  }

  async findTaskById(id, user_id) {
    return Task.findOne({ where: { id, user_id } });
  }

  async countTasksByImageKey(image_key) {
    return Task.count({ where: { image_key } });
  }

  // Update a Task by ID
  async updateTask({ id, user_id, title, description, image_key, completed }) {
    // Holds fields to be updated
    const changes = { title };

    // Include optional fields only when explicitly provided.
    if (description !== undefined) {
      changes.description = description;
    }
    if (image_key !== undefined) {
      changes.image_key = image_key;
    }
    if (completed !== undefined) {
      changes.completed = completed;
    }

    // Update the task belonging to the specified user.
    const [affectedCount] = await Task.update(changes, {
      where: { id, user_id },
    });
    if (!affectedCount) return null;

    return Task.findOne({ where: { id, user_id } });
  }

  // Delete Task by ID
  async deleteTask(id, user_id) {
    // Update the task belonging to the specified user.
    const affectedCount = await Task.destroy({
      where: { id, user_id },
    });
    return affectedCount > 0 ? id : null;
  }
}
