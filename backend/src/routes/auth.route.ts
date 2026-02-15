import express from "express";
import passport from "passport";

import { config } from "../config/app.config.js";
import { googleLoginCallback } from "../controllers/auth.controller.js";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;
export const authRoutes = express.Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginCallback,
);
