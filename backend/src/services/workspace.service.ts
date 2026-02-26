import mongoose from "mongoose";

import { Roles } from "../enums/role.enum.js";
import { TaskStatusEnum } from "../enums/task.enum.js";
import { BadRequestException, NotFoundException } from "../utils/appError.js";

import { MemberModel } from "../models/member.model.js";
import { RoleModel } from "../models/roles-permission.model.js";
import { UserModel } from "../models/user.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";
import { TaskModel } from "../models/task.model.js";
import { getMemberRoleInWorkspace } from "./member.service.js";
import { roleGuard } from "../utils/roleGuard.js";
import { ProjectModel } from "../models/project.model.js";

/**
 * Create a new workspace
 * @param userId - The ID of the user creating the workspace
 * @param body - The workspace data
 * @returns A promise that resolves to the created workspace
 */
export const createWorkspaceService = async (
  userId: string,
  body: { name: string; description?: string | undefined },
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });
  await workspace.save();

  const member = new MemberModel({
    workspaceId: workspace._id,
    userId: user._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });
  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return { workspace };
};

/**
 * Get all workspaces where the user is a member
 * @param userId - The ID of the user
 * @returns A promise that resolves to an array of workspaces
 */
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  // Extract workspace details from the memberships
  const workspaces = memberships.map((membership) => membership.workspaceId);

  return { workspaces };
};

/**
 * Get a workspace by its ID
 * @param workspaceId - The ID of the workspace
 * @returns A promise that resolves to the workspace with its members
 */
export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const members = await MemberModel.find({ workspaceId }).populate("role");

  const workspaceWithMembers = { ...workspace.toObject(), members };

  return { workspace: workspaceWithMembers };
};

/**
 * Get all members of a workspace
 * @param workspaceId - The ID of the workspace
 * @returns A promise that resolves to an object containing members and roles
 */
export const getWorkspaceMembersService = async (workspaceId: string) => {
  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name email profilePicture")
    .populate("role", "name");

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();

  return { members, roles };
};

/**
 * Get analytics for a workspace
 * @param workspaceId - The ID of the workspace
 * @returns A promise that resolves to the workspace analytics
 */
export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();

  const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });

  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };

  return { analytics };
};

/**
 * Change the role of a member in a workspace
 * @param workspaceId - The ID of the workspace
 * @param memberId - The ID of the member
 * @param roleId - The ID of the new role
 * @returns A promise that resolves to the updated member
 */
export const changeWorkspaceMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    workspaceId: workspaceId,
    userId: memberId,
  });
  if (!member) {
    throw new NotFoundException("Member not found in the workspace");
  }

  member.role = role;
  await member.save();

  return { member };
};

/**
 * Update a workspace by its ID
 * @param workspaceId - The ID of the workspace
 * @param name - The new name of the workspace
 * @param description - The new description of the workspace
 * @returns A promise that resolves to the updated workspace
 */
export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string | undefined,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();

  return { workspace };
};

/**
 * Delete a workspace by its ID
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @returns A promise that resolves to the updated user object with the current workspace set to null if it was the deleted workspace
 */
export const deleteWorkspaceByIdService = async (
  workspaceId: string,
  userId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace =
      await WorkspaceModel.findById(workspaceId).session(session);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    // check if the user owns the workspace
    if (workspace.owner.toString() !== userId) {
      throw new BadRequestException(
        "You do not have permission to delete this workspace",
      );
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await ProjectModel.deleteMany({
      workspace: workspace._id,
    }).session(session);

    await TaskModel.deleteMany({
      workspace: workspace._id,
    }).session(session);

    await MemberModel.deleteMany({
      workspaceId: workspace._id,
    }).session(session);

    // update the user's current workspace if it matches the deleted workspace
    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(
        session,
      );

      // update the user's currentWorkspace to the first workspace in the memberWorkspace
      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;

      await user.save({ session });
    }

    await workspace.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      currentWorkspace: user.currentWorkspace,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
