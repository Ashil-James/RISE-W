import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incidents.js";
import broadcastRoutes from "./routes/broadcasts.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { ApiError } from "./utils/ApiError.js";

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/incidents", incidentRoutes);
app.use("/api/v1/broadcasts", broadcastRoutes);
app.use("/api/v1/upload", uploadRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      success: false,
      errors: err.errors,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    success: false,
    errors: [],
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
