import { Request, Response } from 'express';
import { SaveSchema, validateBody } from '../validators/generateSchema';
import { generateSEOContent } from '../services/llmService';
import { createProjectAndOutput } from '../services/dbService';

/**
 * POST /save
 *
 * Explicitly saves a new generation.
 * Accepts the same business input as /generate, runs the full LLM chain,
 * and persists the result. This endpoint allows the frontend to trigger
 * a save/regenerate flow independently.
 */
export async function saveController(
  req: Request,
  res: Response
): Promise<void> {
  // Validate input using the same schema as /generate
  const validation = validateBody(SaveSchema, req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors,
    });
    return;
  }

  const input = validation.data;

  try {
    // Run the LLM chain and persist (same flow as /generate)
    const result = await generateSEOContent(input);
    const { project, output } = await createProjectAndOutput(input, result);

    res.status(201).json({
      success: true,
      message: 'Generation saved successfully',
      projectId: String(project._id),
      outputId: String(output._id),
      keywords: result.keywords,
      gmbPost: result.gmbPost,
      seoDescription: result.seoDescription,
      modelName: result.modelName,
      promptVersion: result.promptVersion,
      createdAt: output.createdAt,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[saveController] Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to save generation. Please try again.',
      detail:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
