import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { Roles } from "../enums/role.enum.js";
import { MemberModel } from "../models/member.model.js";
import { RoleModel } from "../models/roles-permission.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError.js";

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId: userId,
    workspaceId: workspaceId,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }

  const roleName = member.role?.name || "";

  return { role: roleName };
};

export const joinWorkspaceByInviteService = async (
  userId: string,
  inviteCode: string,
) => {
  const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }

  // Check if the user is already a member of the workspace
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).exec();

  if (existingMember) {
    throw new BadRequestException(
      "You are already a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }

  const role = await RoleModel.findOne({ name: Roles.MEMBER });
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // Create a new member if the user is not a member
  const newMember = new MemberModel({
    workspaceId: workspace._id,
    userId,
    role: role._id,
  });
  await newMember.save();

  return { workspaceId: workspace._id, role: role.name };
};
