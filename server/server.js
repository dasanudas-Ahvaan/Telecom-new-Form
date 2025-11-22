import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import next from 'next'; // Import Next.js
import 'dotenv/config';
// Import routes
import registrationRoutes from './routes/registrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// --- CONFIGURATION ---
dotenv.config();

// Setup Next.js
//const dev = process.env.NODE_ENV !== 'production';
const dev = false;
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Prepare Next.js first, then start Express
nextApp.prepare().then(() => {
  connectDB();
  const app = express();

  // --- MIDDLEWARES ---
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Next.js images/scripts to load correctly
  }));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- API ROUTES ---
  app.use('/api', registrationRoutes);
  app.use('/api/admin', adminRoutes);

  // --- SERVE NEXT.JS FRONTEND ---
  // This catches ANY request that isn't an API call and sends it to Next.js
  app.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  // --- ERROR HANDLING ---
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  // --- SERVER START ---
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});