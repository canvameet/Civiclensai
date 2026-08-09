import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { router as complaintsRouter } from './routes/complaints.js';
import { router as socialRouter } from './routes/social.js';
import { router as analyticsRouter } from './routes/analytics.js';
import { router as authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runXScraper } from './services/xScraper.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/social', socialRouter);
app.use('/api/analytics', analyticsRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

// Connect DB then start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
      });

      // Scraping crons — run every 30 minutes
      cron.schedule('*/30 * * * *', async () => {
        console.log('Running scrapers...');
        await runXScraper();
      });

      // Run once on startup
      runXScraper();
    })
    .catch(err => {
      console.error('MongoDB connection failed:', err);
      process.exit(1);
    });
}

export default app;
