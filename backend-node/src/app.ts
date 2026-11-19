import express from "express";
import cors from "cors";
import reportRoutes from "./features/reports/routes/report.route.js";
import { errorHandler } from "./features/reports/controllers/report.controller.js";

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "success",
        message: "EcoTrack API is running"
    });
});

// API routes
app.use("/api", reportRoutes);

// Centralized error handling
app.use(errorHandler);

// Export application
export default app;
