import mongoose from "mongoose";

import { UserModel } from "../models/user.model.js";
import { AccountModel } from "../models/account.model.js";

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
        provider: provider.toLowerCase(),
        providerId: providerId.toLowerCase(),
      });
      await account.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
