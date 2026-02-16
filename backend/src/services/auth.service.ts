import mongoose from "mongoose";

import { UserModel } from "../models/user.model.js";
import { AccountModel } from "../models/account.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";
import { RoleModel } from "../models/roles-permission.model.js";
import { Roles } from "../enums/role.enum.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError.js";
import { MemberModel } from "../models/member.model.js";
import { ProviderEnum } from "../enums/account-provider.enum.js";

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

export const registerUserService = async (body: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Session started...");

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const user = new UserModel({
      name,
      email,
      password,
    });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    const workspace = new WorkspaceModel({
      name: `My Workspace`,
      description: `Workspace for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({
      name: Roles.OWNER,
    }).session(session);

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

    await session.commitTransaction();
    session.endSession();
    console.log("Session ended...");

    return { userId: user._id, workspaceId: workspace._id };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Invalid email");
  }

  const user = await UserModel.findById(account.userId).select("+password");

  if (!user) {
    throw new NotFoundException("User not found for this account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid password");
  }

  return user.omitPassword();
};
