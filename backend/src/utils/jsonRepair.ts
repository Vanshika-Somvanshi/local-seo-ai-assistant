/**
 * JSON Repair Utility
 *
 * LLMs sometimes return JSON wrapped in markdown code fences or with
 * minor formatting issues. This utility provides safe, defensive parsing
 * with multiple fallback strategies before giving up.
 */

/**
 * Attempt to extract and parse a JSON object from an LLM response string.
 *
 * Strategy order:
 *  1. Direct JSON.parse (happy path)
 *  2. Strip markdown code fences (```json ... ```)
 *  3. Extract the first {...} block with a regex
 *  4. Throw a structured error
 */
export function safeParseJSON<T = Record<string, unknown>>(raw: string): T {
  // Strategy 1 — Direct parse (most responses will succeed here)
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Fall through to repair strategies
  }

  // Strategy 2 — Strip markdown fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/im, '') // opening fence
    .replace(/\s*```\s*$/im, '')        // closing fence
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    // Fall through
  }

  // Strategy 3 — Extract first {...} block
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      // Fall through
    }
  }

  // Strategy 4 — Give up with a helpful error
  console.error('[jsonRepair] All strategies failed. Raw LLM response:');
  console.error(raw.substring(0, 500)); // log first 500 chars for debugging
  throw new JSONRepairError(
    'Failed to parse JSON from LLM response after all repair strategies',
    raw
  );
}

/**
 * Validate that a parsed object contains all required keys.
 * Throws if any key is missing.
 */
export function assertKeys<T extends object>(
  obj: T,
  requiredKeys: (keyof T)[]
): void {
  for (const key of requiredKeys) {
    if (!(key in obj) || obj[key] === undefined || obj[key] === null) {
      throw new JSONRepairError(
        `Missing required key in LLM response: "${String(key)}"`,
        JSON.stringify(obj)
      );
    }
  }
}

/**
 * Ensure a value is a non-empty string array.
 * Returns the array if valid, or an empty array as fallback.
 */
export function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
    return value as string[];
  }
  if (typeof value === 'string') {
    // Sometimes the LLM returns a comma-separated string instead of an array
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Custom error class for JSON repair failures */
export class JSONRepairError extends Error {
  public readonly rawResponse: string;

  constructor(message: string, rawResponse: string) {
    super(message);
    this.name = 'JSONRepairError';
    this.rawResponse = rawResponse;
  }
}
