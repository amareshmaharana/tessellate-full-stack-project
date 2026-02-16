import { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import { getCurrentUserService } from "../services/user.service.js";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  },
);
