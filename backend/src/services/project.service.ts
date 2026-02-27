import mongoose from "mongoose";

import { ProjectModel } from "../models/project.model.js";
import { TaskModel } from "../models/task.model.js";

import { NotFoundException } from "../utils/appError.js";
import { TaskStatusEnum } from "../enums/task.enum.js";

/**
 * Creates a new project in the specified workspace.
 *
 * @param userId - The ID of the user creating the project.
 * @param workspaceId - The ID of the workspace where the project will be created.
 * @param body - The project creation data, including emoji, name, and description.
 * @returns A promise that resolves to the created project.
 */
export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: {
    emoji?: string | undefined;
    name: string;
    description?: string | undefined;
  },
) => {
  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  return { project };
};

/**
 * Retrieves all projects in a specified workspace with pagination.
 *
 * @param workspaceId - The ID of the workspace to retrieve projects from.
 * @param pageSize - The number of projects to return per page.
 * @param pageNumber - The page number to retrieve.
 * @returns A promise that resolves to an object containing the projects, total count, total pages, and skip value.
 */
export const getAllProjectsInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({ workspace: workspaceId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};

/**
 * Retrieves a project by its ID and workspace ID.
 *
 * @param workspaceId - The ID of the workspace where the project belongs.
 * @param projectId - The ID of the project to retrieve.
 * @returns A promise that resolves to the project with the specified ID and workspace ID.
 * @throws NotFoundException if the project is not found or does not belong to the specified workspace.
 */
export const getProjectByIdAndWorkspaceIdService = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace",
    );
  }

  return { project };
};

/**
 * Retrieves analytics for a project, including total tasks, overdue tasks, and completed tasks.
 *
 * @param workspaceId - The ID of the workspace where the project belongs.
 * @param projectId - The ID of the project to retrieve analytics for.
 * @returns A promise that resolves to an object containing the project analytics.
 * @throws NotFoundException if the project is not found or does not belong to the specified workspace.
 */
export const getProjectAnalyticsService = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace",
    );
  }

  const currentDate = new Date();

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return { analytics };
};

/**
 * Updates a project with the specified ID and workspace ID.
 *
 * @param workspaceId - The ID of the workspace where the project belongs.
 * @param projectId - The ID of the project to update.
 * @param body - The updated project data.
 * @returns A promise that resolves to the updated project.
 * @throws NotFoundException if the project is not found or does not belong to the specified workspace.
 */
export const updateProjectService = async (
  workspaceId: string,
  projectId: string,
  body: {
    emoji?: string | undefined;
    name: string;
    description?: string | undefined;
  },
) => {
  const { name, emoji, description } = body;

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace",
    );
  }

  if (emoji) project.emoji = emoji;
  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return { project };
};

/**
 * Deletes a project with the specified ID and workspace ID.
 *
 * @param workspaceId - The ID of the workspace where the project belongs.
 * @param projectId - The ID of the project to delete.
 * @returns A promise that resolves to the deleted project.
 * @throws NotFoundException if the project is not found or does not belong to the specified workspace.
 */
export const deleteProjectService = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace",
    );
  }

  await TaskModel.deleteMany({
    project: project._id,
  });

  await project.deleteOne();

  return { project };
};
