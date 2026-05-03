import { Router, Request, Response } from 'express';
import { generateController } from '../controllers/generateController';
import { historyController } from '../controllers/historyController';
import { saveController } from '../controllers/saveController';

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
/**
 * GET /health
 * Used by Render and uptime monitors to verify the service is running.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'GrowthPro AI API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── SEO Generation ───────────────────────────────────────────────────────────
/**
 * POST /generate
 * Validates input, runs 3-step LLM chain, saves to DB, returns result.
 */
router.post('/generate', generateController);

// ─── History ──────────────────────────────────────────────────────────────────
/**
 * GET /history?page=1&limit=10
 * Returns paginated generation history with project + output data.
 */
router.get('/history', historyController);

// ─── Explicit Save ────────────────────────────────────────────────────────────
/**
 * POST /save
 * Explicitly saves/regenerates content for the given business input.
 */
router.post('/save', saveController);

export default router;
