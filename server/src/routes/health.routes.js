import { Router } from "express";
import sequelize from "../config/database.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", message: "Task App API is running." });
});

router.get("/db", async (req, res) => {
  const requiredSettings = ["DB_HOST", "DB_USER", "DB_NAME"];
  const missingSettings = requiredSettings.filter(
    (setting) => !process.env[setting],
  );

  if (missingSettings.length > 0) {
    return res.status(503).json({
      status: "error",
      message: `Set ${missingSettings.join(", ")} in server/.env before checking the database.`,
    });
  }

  try {
    await sequelize.authenticate();
    return res.json({
      status: "ok",
      database: sequelize.config.database,
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return res.status(503).json({
      status: "error",
      message:
        "Could not connect to MySQL. Check that MySQL is running and the server/.env settings are correct.",
    });
  }
});

export default router;
