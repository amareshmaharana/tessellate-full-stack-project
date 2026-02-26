import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, { message: "Name is required" })
  .max(255)
  .trim();

export const descriptionSchema = z.string().trim().optional();

export const workspaceIdSchema = z
  .string()
  .trim()
  .min(1, { message: "Workspace Id is required" });

export const changeRoleSchema = z.object({
  memberId: z.string().trim().min(1),
  roleId: z.string().trim().min(1),
});

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});
