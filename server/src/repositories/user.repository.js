import pool from "../config/database.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE email = ?
    `,
    [email],
  );

  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `
        SELECT id, email,  created_at
        FROM users
        WHERE id = ?
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function createUser(email, password_hash) {
  const [result] = await pool.execute(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
    [email, password_hash],
  );

  return {
    id: result.insertId,
    email,
  };
}
