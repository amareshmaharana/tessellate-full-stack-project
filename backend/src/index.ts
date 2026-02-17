import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import session from "cookie-session";
import passport from "passport";

import { config } from "./config/app.config.js";
import { connectDB } from "./config/db.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { HTTP_STATUS } from "./config/http.config.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { BadRequestException } from "./utils/appError.js";
import { ErrorCodeEnum } from "./enums/error-code.enum.js";
import { authRoutes } from "./routes/auth.route.js";
import "./config/passport.config.js";
import { userRoutes } from "./routes/user.route.js";
import { isAuthenticated } from "./middlewares/isAuthenticated.middleware.js";
import { workspaceRoutes } from "./routes/workspace.route.js";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN,
    );
    res.status(HTTP_STATUS.OK).json({
      message: "Project Management System API",
    });
  }),
);

// Routes from here
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server is listening on port: ${config.PORT} in ${config.NODE_ENV} mode`,
  );
  await connectDB();
});
