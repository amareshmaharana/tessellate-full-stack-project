import mongoose, { Document, Schema } from "mongoose";

import {
  ProviderEnum,
  ProviderEnumType,
} from "../enums/account-provider.enum.js";

export interface AccountDocument extends Document {
  userId: mongoose.Types.ObjectId;
  provider: ProviderEnumType;
  providerId: string;
  refreshToken?: string | null;
  tokenExpiry?: Date | null;
  createdAt: Date;
}

const accountSchema = new Schema<AccountDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      required: true,
    },
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.refreshToken;
      },
    },
  },
);

export const AccountModel = mongoose.model<AccountDocument>(
  "Account",
  accountSchema,
);
