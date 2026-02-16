import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { config } from "../config/app.config.js";
import { loginSchema, registerSchema } from "../validation/auth.validation.js";
import { HTTP_STATUS } from "../config/http.config.js";
import { registerUserService } from "../services/auth.service.js";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
      );
    }

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`,
    );
  },
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
    });
  },
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined,
      ) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid credentials",
          });
        }
        req.logIn(user, async (err) => {
          if (err) {
            return next(err);
          }
          return res.status(HTTP_STATUS.OK).json({
            message: "User logged in successfully",
            user,
          });
        });
      },
    )(req, res, next);
  },
);

export const logoutUserController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.logOut((err) => {
      if (err) {
        // return next(err);
        console.error("Error logging out user:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: "Error logging out user",
        });
      }
    });

    req.session = null;
    return res.status(HTTP_STATUS.OK).json({
      message: "User logged out successfully",
    });
  },
);
