import cors from "cors";
import express from "express";
import session from "express-session";
import healthRoutes from "./routes/health.routes.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import routes from "./routes/index.routes.js";
import { uploadDirectory } from "./middleware/upload.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: "Too many attempts. Please try again in a while!",
});

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be added in server/.env");
}

app.use(
  session({
    name: "task.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api/health", healthRoutes);
app.use("/api/v1", apiLimiter, routes);
app.use(
  "/uploads",
  helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }),
  express.static(uploadDirectory, { index: false, dotfiles: "deny" }),
);
app.use(notFound);
app.use(errorHandler);

export default app;
