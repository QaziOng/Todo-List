import { Router } from "express";
import { validate } from "../middleware/validate";
import { taskSchema } from "../validators/task.validator";
import {
  createTask,
  deleteTask,
  updateTask,
} from "../controllers/task.controller";

const router = Router();

router.post("/tasks", validate(taskSchema), createTask);
router.put("/tasks/:id", validate(taskSchema), updateTask);
router.delete("/tasks/:id", deleteTask);
