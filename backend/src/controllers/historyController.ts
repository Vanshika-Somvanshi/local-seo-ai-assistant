import { Request, Response } from 'express';
import { getHistory } from '../services/dbService';

/**
 * GET /history?page=1&limit=10
 *
 * Returns paginated generation history, sorted newest first.
 * Each item contains both the project and the output document.
 */
export async function historyController(
  req: Request,
  res: Response
): Promise<void> {
  // Parse and sanitise pagination query params
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1 || limit < 1 || limit > 50) {
    res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters. page >= 1, 1 <= limit <= 50',
    });
    return;
  }

  try {
    const result = await getHistory(page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[historyController] Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch history. Please try again.',
      detail:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
