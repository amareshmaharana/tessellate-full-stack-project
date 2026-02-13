import mongoose, { Document, Schema } from "mongoose";

import { RoleDocument } from "./roles-permission.model.js";

export interface MemberDocument extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  role: RoleDocument;
  joinedAt: Date;
}

const memberSchema = new Schema<MemberDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const MemberModel = mongoose.model<MemberDocument>(
  "Member",
  memberSchema,
);
