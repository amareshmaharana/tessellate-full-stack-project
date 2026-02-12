import type { ErrorRequestHandler } from "express";

import { HTTP_STATUS } from "../config/http.config.js";
import { AppError } from "../utils/appError.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
): any => {
  console.error(`Error occured on PATH: ${req.path} `, error);

  if (error instanceof SyntaxError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid JSON format. Please check your request payload.",
      error: error.message || "Unknown error occurred",
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      error: error.errorCode,
    });
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error.message || "Unknown error occurred",
  });
};
