// -------------------------------------------------------
//  server.js  (Full Updated Version for AWS Deployment)
// -------------------------------------------------------

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "*", // Allow requests from frontend IP
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use(express.json());

// -------------------------------------------------------
// MongoDB Connection
// -------------------------------------------------------

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGODB_URI not found in .env");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
        console.error("❌ MongoDB Error:", err.message);
        process.exit(1);
    });

// -------------------------------------------------------
// Test / Health Route
// -------------------------------------------------------
app.get("/api/health", (req, res) => {
    res.json({
        
        message: "Backend server is running properly",
        environment: process.env.NODE_ENV,
        timestamp: new Date()
    });
});

// -------------------------------------------------------
// Other Routes (Example)
// -------------------------------------------------------
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";   // VERY IMPORTANT FOR AWS!!!

const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

