import mongoose, { Document, Schema } from "mongoose";
import {
  TaskStatusEnumType,
  TaskPriorityEnumType,
  TaskPriorityEnum,
  TaskStatusEnum,
} from "../enums/task.enum.js";
import { generateTaskCode } from "../utils/uuid.js";

export interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    taskCode: { type: String, default: generateTaskCode, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum),
      default: TaskStatusEnum.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum),
      default: TaskPriorityEnum.MEDIUM,
    },
    dueDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);