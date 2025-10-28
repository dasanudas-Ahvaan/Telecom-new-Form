import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js'; // Adjusted path

// Import routes
import registrationRoutes from './routes/registrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// --- 1. CONFIGURATION AND SETUP ---
dotenv.config();
connectDB(); 
const app = express();

// --- 2. MIDDLEWARES ---
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. API ROUTES ---
app.get('/', (req, res) => res.send('Ahvaan Telecom API is running...')); // Keep basic test route

// Mount the imported routes
app.use('/api', registrationRoutes); // Handles /api/start, /api/otp/verify, /api/register, /api/form
app.use('/api/admin', adminRoutes); // Handles all routes starting with /api/admin/*


// --- 4. ERROR HANDLING ---
// Custom Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: statusCode
  });
});

// 404 Not Found Handler (should be last)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found', code: 404 });
});

// --- 5. SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});