import express from "express";

import {
  createProjectController,
  deleteProjectController,
  getAllProjectsInWorkspaceController,
  getProjectAnalyticsController,
  getProjectByIdAndWorkspaceIdController,
  updateProjectController,
} from "../controllers/project.controller.js";

export const projectRoutes = express.Router();

projectRoutes.post(
  "/workspace/:workspaceId/create-project",
  createProjectController,
);

projectRoutes.put(
  "/workspace/:workspaceId/project-:id/update",
  updateProjectController,
);

projectRoutes.delete(
  "/workspace/:workspaceId/project-:id/delete",
  deleteProjectController,
);

projectRoutes.get(
  "/workspace/:workspaceId/all-projects",
  getAllProjectsInWorkspaceController,
);

projectRoutes.get(
  "/workspace/:workspaceId/project-:id/analytics",
  getProjectAnalyticsController,
);

projectRoutes.get(
  "/workspace/:workspaceId/project-:id",
  getProjectByIdAndWorkspaceIdController,
);
