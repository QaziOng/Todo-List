import pool from "../config/database";
import Task from "../models/task.model";

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

    return rows.length ? rows.map((row) => new Task(row)) : null;
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
                image_url = ?
            WHERE
                id = ? AND user_id = ?
        `,
      [id, user_id, title, description, image_url, completed],
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
