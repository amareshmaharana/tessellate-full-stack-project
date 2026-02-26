import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { PermissionType } from "../enums/role.enum.js";
import { UnauthorizedException } from "./appError.js";
import { RolePermissions } from "./role-permission.js";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[],
) => {
  const permissions = RolePermissions[role];
  //   if the role doesn't exist or lacks required permissions, throw an exception
  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission),
  );
  if (!hasPermissions) {
    throw new UnauthorizedException(
      "You do not have the necessary permissions to perform this action",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }
  return permissions;
};
