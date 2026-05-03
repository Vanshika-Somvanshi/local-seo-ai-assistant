import { z } from 'zod';

/**
 * Zod schema for validating the POST /generate request body.
 * Enforces required fields, trims whitespace, and validates lengths.
 */
export const GenerateSchema = z.object({
  businessName: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name must not exceed 200 characters'),

  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must not exceed 100 characters'),

  location: z
    .string({ required_error: 'Location (city) is required' })
    .trim()
    .min(2, 'Location must be at least 2 characters')
    .max(200, 'Location must not exceed 200 characters'),

  description: z
    .string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),

  targetAudience: z
    .string()
    .trim()
    .max(500, 'Target audience must not exceed 500 characters')
    .optional(),
});

/** Inferred TypeScript type from the Zod schema */
export type GenerateInput = z.infer<typeof GenerateSchema>;

/**
 * Zod schema for validating POST /save request body.
 * Same as GenerateSchema but all fields optional for explicit saves.
 */
export const SaveSchema = GenerateSchema;
export type SaveInput = GenerateInput;

/**
 * Validate request body against a Zod schema.
 * Returns { success, data, errors }.
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );
  return { success: false, errors };
}
