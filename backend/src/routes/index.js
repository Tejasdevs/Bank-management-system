import express from 'express';
import { sequelize } from '../models/index.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error',
      database: 'connection failed',
      error: error.message
    });
  }
});

export default router;
