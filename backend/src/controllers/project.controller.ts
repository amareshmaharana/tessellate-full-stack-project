import { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "../validation/project.validation.js";
import { workspaceIdSchema } from "../validation/workspace.validation.js";

import { getMemberRoleInWorkspace } from "../services/member.service.js";
import {
  createProjectService,
  deleteProjectService,
  getAllProjectsInWorkspaceService,
  getProjectAnalyticsService,
  getProjectByIdAndWorkspaceIdService,
  updateProjectService,
} from "../services/project.service.js";

import { roleGuard } from "../utils/roleGuard.js";
import { Permissions } from "../enums/role.enum.js";

import { HTTP_STATUS } from "../config/http.config.js";

export const createProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_PROJECT]);

    const { project } = await createProjectService(userId, workspaceId, body);

    res.status(HTTP_STATUS.CREATED).json({
      message: "Project created successfully",
      project,
    });
  },
);

export const getAllProjectsInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;

    const { projects, totalCount, totalPages, skip } =
      await getAllProjectsInWorkspaceService(workspaceId, pageSize, pageNumber);

    res.status(HTTP_STATUS.OK).json({
      message: "Projects retrieved successfully",
      projects,
      pagination: {
        totalCount,
        totalPages,
        skip,
        pageSize,
        limit: pageSize,
        pageNumber,
      },
    });
  },
);

export const getProjectByIdAndWorkspaceIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { project } = await getProjectByIdAndWorkspaceIdService(
      workspaceId,
      projectId,
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Project By Id retrieved successfully",
      project,
    });
  },
);

export const getProjectAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getProjectAnalyticsService(
      workspaceId,
      projectId,
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Project analytics retrieved successfully",
      analytics,
    });
  },
);

export const updateProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const body = updateProjectSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const { project } = await updateProjectService(
      workspaceId,
      projectId,
      body,
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Project updated successfully",
      project,
    });
  },
);

export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_PROJECT]);

    const { project } = await deleteProjectService(
      workspaceId,
      projectId,
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Project deleted successfully",
      project,
    });
  },
);