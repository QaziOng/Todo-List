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

  // Update a Task by ID
  async updateTask({
    id,
    user_id,
    title,
    description = null,
    image_url = null,
    completed = null,
  }) {
    const [affectedCount] = await Task.update(
      {
        title,
        description,
        image_url,
        completed,
      },
      {
        where: { id, user_id },
      },
    );
    return affectedCount > 0 ? id : null;
  }

  // Delete Task by ID
  async deleteTask(id, user_id) {
    const affectedCount = await Task.destroy({
      where: { id, user_id },
    });
    return affectedCount > 0 ? id : null;
  }
}
