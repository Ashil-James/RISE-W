import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

// routes declaration
app.use("/api/v1/users", userRouter); // Unified user routes (auth + profile)
app.use("/api/v1/incidents", incidentRouter);
app.use("/api/v1/broadcasts", broadcastRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/admin", adminRouter);

// backward compatibility for /auth if needed, or just use /users
app.use("/api/v1/auth", userRouter);

export { app };
