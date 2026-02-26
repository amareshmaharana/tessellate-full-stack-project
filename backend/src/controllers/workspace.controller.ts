import { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import {
  changeRoleSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
} from "../validation/workspace.validation.js";

import { HTTP_STATUS } from "../config/http.config.js";

import {
  changeWorkspaceMemberRoleService,
  createWorkspaceService,
  deleteWorkspaceByIdService,
  getAllWorkspacesUserIsMemberService,
  getWorkspaceAnalyticsService,
  getWorkspaceByIdService,
  getWorkspaceMembersService,
  updateWorkspaceByIdService,
} from "../services/workspace.service.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";

import { Permissions } from "../enums/role.enum.js";

import { roleGuard } from "../utils/roleGuard.js";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;
    const { workspace } = await createWorkspaceService(userId, body);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Workspace created successfully",
      workspace,
    });
  },
);

export const getAllWorkspacesUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User workspaces fetched successfully",
      workspaces,
    });
  },
);

export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    await getMemberRoleInWorkspace(userId, workspaceId);

    const { workspace } = await getWorkspaceByIdService(workspaceId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Workspace fetched successfully",
      workspace,
    });
  },
);

export const getWorkspaceMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { members, roles } = await getWorkspaceMembersService(workspaceId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Workspace members fetched successfully",
      members,
      roles,
    });
  },
);

export const getWorkspaceAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Workspace analytics fetched successfully",
      analytics,
    });
  },
);

export const changeWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const { member } = await changeWorkspaceMemberRoleService(
      workspaceId,
      memberId,
      roleId,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Workspace member role changed successfully",
      member,
    });
  },
);

export const updateWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { name, description } = updateWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_WORKSPACE]);

    const { workspace } = await updateWorkspaceByIdService(
      workspaceId,
      name,
      description,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Workspace updated successfully",
      workspace,
    });
  },
);

export const deleteWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    const { currentWorkspace } = await deleteWorkspaceByIdService(
      workspaceId,
      userId,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Workspace deleted successfully",
      currentWorkspace,
    });
  },
);
