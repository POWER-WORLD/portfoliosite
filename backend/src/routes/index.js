import express from 'express';
import portfolioRoutes from './portfolio.js';

const router = express.Router();

// Forward endpoints
router.use('/', portfolioRoutes);

export default router;
