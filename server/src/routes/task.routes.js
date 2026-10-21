import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { taskSchema } from "../validators/task.validator.js";
import {
  createTask,
  deleteTask,
  getAllTask,
  updateTask,
} from "../controllers/task.controller.js";

const router = Router();

router.use(authenticate);

router.post("/create", validate(taskSchema), createTask);
router.put("/:id", validate(taskSchema), updateTask);
router.delete("/:id", deleteTask);
router.get("/", getAllTask);

export default router;
