import { HttpStatusCodeType, HTTP_STATUS } from "../config/http.config.js";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums/error-code.enum.js";

export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode?: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType,
  ) {
    super(message);
    this.statusCode = statusCode;
    if (errorCode !== undefined) this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(
    message: "Http Exception Error",
    statusCode: HttpStatusCodeType,
    errorCode?: ErrorCodeEnumType,
  ) {
    super(
      message,
      statusCode,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InternalServerException extends AppError {
  constructor(
    message = "Internal Server Error",
    errorCode?: ErrorCodeEnumType,
  ) {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    );
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource Not Found", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.NOT_FOUND,
      errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND,
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST,
      errorCode || ErrorCodeEnum.VALIDATION_ERROR,
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }
}
