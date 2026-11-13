import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`EcoTrack API running on port ${PORT}`);
});

// Handle unexpected errors
server.on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
});