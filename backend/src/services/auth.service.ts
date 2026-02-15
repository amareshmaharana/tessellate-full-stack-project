import mongoose from "mongoose";

import { UserModel } from "../models/user.model.js";
import { AccountModel } from "../models/account.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";
import { RoleModel } from "../models/roles-permission.model.js";
import { Roles } from "../enums/role.enum.js";
import { NotFoundException } from "../utils/appError.js";
import { MemberModel } from "../models/member.model.js";

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  email?: string;
  picture?: string;
}) => {
  const { provider, displayName, providerId, email, picture } = data;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Session started...");

    let user = email ? await UserModel.findOne({ email }) : null;

    if (!user) {
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save({ session });

      //   create a new workspace for new user
      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      });

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    console.log("Session ended...");

    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};
