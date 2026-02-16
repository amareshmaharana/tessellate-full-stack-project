import type { ErrorRequestHandler, Response } from "express";

import { HTTP_STATUS } from "../config/http.config.js";
import { AppError } from "../utils/appError.js";
import { ZodError } from "zod";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";

const formatZodError = (res: Response, error: ZodError) => {
  const errors = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: "Validation error",
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

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

  if (error instanceof ZodError) {
    return formatZodError(res, error);
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
