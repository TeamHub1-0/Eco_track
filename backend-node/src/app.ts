import express from "express";
import cors from "cors";

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "EcoTrack API is running"
    });
});

// Export application
export default app; 