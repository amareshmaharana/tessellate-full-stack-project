import { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import { HTTP_STATUS } from "../config/http.config.js";

import { joinWorkspaceByInviteService } from "../services/member.service.js";

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const inviteCode = z.string().parse(req.params.inviteCode);
    const userId = req.user?._id;

    const { workspaceId, role } = await joinWorkspaceByInviteService(
      userId,
      inviteCode,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "The member joined the workspace successfully",
      workspaceId,
      role,
    });
  },
);
