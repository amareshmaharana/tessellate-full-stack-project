import mongoose, { Document, Schema } from "mongoose";

import {
  Permissions,
  PermissionType,
  Roles,
  RoleType,
} from "../enums/role.enum.js";
import { RolePermissions } from "../utils/role-permission.js";

export interface RoleDocument extends Document {
  name: RoleType;
  permissions: Array<PermissionType>;
}

const roleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      enum: Object.values(Roles),
      unique: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: Object.values(Permissions),
      default: function (this: RoleDocument) {
        return RolePermissions[this.name];
      },
    },
  },
  {
    timestamps: true,
  },
);

export const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
