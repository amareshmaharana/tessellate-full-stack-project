export const TaskStatusEnum = {
  TODO: "TODO",
  BACKLOG: "BACKLOG",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export const TaskPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;
export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
