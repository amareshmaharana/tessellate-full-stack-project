import express from "express";

import { getCurrentUserController } from "../controllers/user.controller.js";

export const userRoutes = express.Router();

userRoutes.get('/current', getCurrentUserController);
