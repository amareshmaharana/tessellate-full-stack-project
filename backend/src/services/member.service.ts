import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { MemberModel } from "../models/member.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";
import { NotFoundException, UnauthorizedException } from "../utils/appError.js";

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    user: userId,
    workspace: workspaceId,
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
