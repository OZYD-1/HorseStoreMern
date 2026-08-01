import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import env from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- Security & core middleware ----
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: [env.clientUrl, env.adminUrl],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// ---- Rate limiting (protects auth endpoints from brute force) ----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/admin-login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ---- Static files (uploaded images) ----
app.use("/uploads", express.static(path.join(__dirname, "..", env.upload.dir)));

// ---- API routes ----
app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HorseStore API is running" });
});

// ---- 404 + error handler (always last) ----
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
