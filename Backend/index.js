import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incidents.js";
import broadcastRoutes from "./routes/broadcasts.js";
import uploadRoutes from "./routes/uploadRoutes.js";

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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
