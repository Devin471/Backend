const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load .env from project root
dotenv.config({ path: '../.env' });

// Initialize Cloudinary (optional)
require('./config/cloudinary');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://10.0.2.2:19006',
    'exp://',
    'exps://',
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []),
    ...(process.env.MOBILE_CLIENT_ORIGINS ? process.env.MOBILE_CLIENT_ORIGINS.split(',') : [])
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(o => origin.startsWith(o) || o.startsWith(origin))) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
}));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ status: 'error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
    server.close(() => console.log('👋 Server terminated'));
});

module.exports = app;
