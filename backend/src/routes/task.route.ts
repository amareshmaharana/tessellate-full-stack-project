import express from "express";
import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
} from "../controllers/task.controller.js";

export const taskRoutes = express.Router();

taskRoutes.post(
  "/workspace/:workspaceId/project/:projectId/create-task",
  createTaskController,
);

taskRoutes.delete(
  "/workspace/:workspaceId/task-:id/delete",
  deleteTaskController,
);

taskRoutes.put(
  "/workspace/:workspaceId/project/:projectId/task-:id/update",
  updateTaskController,
);

taskRoutes.get("/workspace/:workspaceId/all-tasks", getAllTasksController);

taskRoutes.get(
  "/workspace/:workspaceId/project/:projectId/task-:id",
  getTaskByIdController,
);
