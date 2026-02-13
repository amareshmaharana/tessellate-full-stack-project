import mongoose, { Document, Schema } from "mongoose";

import { compareValue, hashValue } from "../utils/bcrypt.js";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, default: null, select: false },
    profilePicture: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Pre-save hook to hash the password before saving the user document.
 */
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  // next();
});

/**
 * Omit the password field from the user document.
 * @returns The user document without the password field.
 */
userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

/**
 * Compare the password with the hashed password.
 * @param value - The password to compare.
 * @returns True if the password matches, false otherwise.
 */
userSchema.methods.comparePassword = async function (value: string) {
  return await compareValue(value, this.password || "");
};

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
