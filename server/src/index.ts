import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth';
import onboardingRoutes from './routes/onboarding';
import guestRoutes from './routes/guests';
import budgetRoutes from './routes/budget';
import todoRoutes from './routes/todos';
import vendorRoutes from './routes/vendors';
import seatingRoutes from './routes/seating';
import sharingRoutes from './routes/sharing';
import bachelorTripRoutes from './routes/bachelorTrip';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/seating', seatingRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/bachelor-trip', bachelorTripRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vivaha API is running' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedwise';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
