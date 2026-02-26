import express from "express";

import { joinWorkspaceController } from "../controllers/member.controller.js";

export const memberRoutes = express.Router();

memberRoutes.post("/workspace/:inviteCode/join", joinWorkspaceController);
