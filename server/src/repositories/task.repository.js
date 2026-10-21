import pool from "../config/database.js";
import Task from "../models/task.model.js";

export default class TaskRepository {
  // Get a Task by its ID
  async findTaskById(id, user_id) {
    const [rows] = await pool.execute(
      `
                SELECT id, user_id, title, description, image_url, completed
                FROM tasks
                WHERE
                    id = ? AND user_id = ?
            `,
      [id, user_id],
    );

    return rows.length ? new Task(rows[0]) : null;
  }

  // Get all Tasks by the userId
  async findTasksByUserId(user_id) {
    const [rows] = await pool.execute(
      `
                SELECT id, user_id, title, description, image_url, completed
                FROM tasks
                WHERE
                    user_id = ?
            `,
      [user_id],
    );

    return rows.map((row) => new Task(row));
  }

  // Create a New Task
  async createTask({ user_id, title, description = null, image_url = null }) {
    const [result] = await pool.execute(
      `
                INSERT INTO tasks 
                    (user_id,title,description,image_url)
                VALUES (?,?,?,?)
            `,
      [user_id, title, description, image_url],
    );

    return this.findTaskById(result.insertId, user_id);
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
    const [result] = await pool.execute(
      `
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                image_url = ?,
                completed = ?
            WHERE
                id = ? AND user_id = ?
        `,
      [title, description, image_url, completed, id, user_id],
    );

    return result.affectedRows > 0 ? id : null;
  }

  // Delete Task by ID
  async deleteTask(id, user_id) {
    const [result] = await pool.execute(
      `
            DELETE FROM tasks
            WHERE
                id = ? AND user_id = ?
        `,
      [id, user_id],
    );

    return result.affectedRows > 0 ? id : null;
  }
}
