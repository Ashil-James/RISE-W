import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import incidentRouter from "./routes/incident.routes.js";
import broadcastRouter from "./routes/broadcast.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import adminRouter from "./routes/admin.routes.js";
import authorityRouter from "./routes/authority.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import weatherRouter from "./routes/weather.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter); // Unified user routes (auth + profile)
app.use("/api/v1/incidents", incidentRouter);
app.use("/api/v1/broadcasts", broadcastRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/authority", authorityRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/weather", weatherRouter);

// backward compatibility for /auth if needed, or just use /users
app.use("/api/v1/auth", userRouter);

// common error handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export { app };

// Prevent server from crashing on unhandled errors
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
