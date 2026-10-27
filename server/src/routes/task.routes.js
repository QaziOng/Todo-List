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
import { uploadImage, verifyUploadedImage } from "../middleware/upload.js";

const router = Router();

// Authentication
router.use(authenticate);

// Creating a Task
router.post(
  "/create",
  uploadImage.single("image"),
  verifyUploadedImage,
  validate(taskSchema),
  createTask,
);
// Updating a Task
router.put(
  "/:id",
  uploadImage.single("image"),
  verifyUploadedImage,
  validate(taskSchema),
  updateTask,
);
// Deleting a Task
router.delete("/:id", deleteTask);
// Finding all Tasks from a User
router.get("/", getAllTask);

export default router;
