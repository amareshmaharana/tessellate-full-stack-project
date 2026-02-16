import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError.js";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized, Please login first");
  }
  next();
};
