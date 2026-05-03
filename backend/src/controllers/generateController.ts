import { Request, Response } from 'express';
import { GenerateSchema, validateBody } from '../validators/generateSchema';
import { generateSEOContent } from '../services/llmService';
import { createProjectAndOutput } from '../services/dbService';

/**
 * POST /generate
 *
 * Full pipeline:
 *  1. Validate input with Zod
 *  2. Run 3-step LLM generation chain
 *  3. Persist project + output to MongoDB
 *  4. Return structured response to frontend
 */
export async function generateController(
  req: Request,
  res: Response
): Promise<void> {
  // ── 1. Validate Input ──────────────────────────────────────────────────────
  const validation = validateBody(GenerateSchema, req.body);
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
    // ── 2. Generate SEO Content via LLM ───────────────────────────────────────
    const result = await generateSEOContent(input);

    // ── 3. Save to Database ───────────────────────────────────────────────────
    const { project, output } = await createProjectAndOutput(input, result);

    // ── 4. Return Structured Response ─────────────────────────────────────────
    res.status(200).json({
      success: true,
      projectId: String(project._id),
      outputId: String(output._id),
      businessName: project.businessName,
      category: project.category,
      location: project.location,
      keywords: result.keywords,
      gmbPost: result.gmbPost,
      seoDescription: result.seoDescription,
      modelName: result.modelName,
      promptVersion: result.promptVersion,
      createdAt: output.createdAt,
    });
  } catch (err: unknown) {
    // Differentiate LLM errors from DB errors for better observability
    const error = err as Error;
    console.error('[generateController] Error:', error.message);

    const isLLMError =
      error.message.includes('LLM') ||
      error.message.includes('OpenAI') ||
      error.message.includes('Groq') ||
      error.message.includes('JSON');

    res.status(500).json({
      success: false,
      message: isLLMError
        ? 'AI generation failed. Please try again.'
        : 'Server error. Please try again.',
      detail:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
