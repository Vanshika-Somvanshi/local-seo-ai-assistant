import axios, { AxiosError } from 'axios';
import type {
  BusinessInput,
  GenerationResult,
  HistoryResponse,
  APIError,
} from '../types';

// ─── Axios Instance ───────────────────────────────────────────────────────────

/**
 * Base Axios instance configured from the VITE_API_BASE_URL environment variable.
 * Falls back to localhost:5000 for local development.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 120000, // 2 minutes — LLM generation can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Error Normaliser ─────────────────────────────────────────────────────────

/**
 * Convert any Axios error into a normalised APIError object for clean error
 * handling in the UI layer.
 */
function normaliseError(error: unknown): APIError {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as
      | { message?: string; errors?: string[] }
      | undefined;

    return {
      message:
        responseData?.message ||
        error.message ||
        'An unexpected error occurred',
      errors: responseData?.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * POST /generate
 * Sends business input and returns the full structured AI-generated result.
 */
export async function generate(input: BusinessInput): Promise<GenerationResult> {
  try {
    const { data } = await api.post<GenerationResult>('/generate', input);
    return data;
  } catch (error) {
    throw normaliseError(error);
  }
}

/**
 * GET /history?page=&limit=
 * Fetches paginated history of previous generations.
 */
export async function fetchHistory(
  page = 1,
  limit = 10
): Promise<HistoryResponse> {
  try {
    const { data } = await api.get<HistoryResponse>('/history', {
      params: { page, limit },
    });
    return data;
  } catch (error) {
    throw normaliseError(error);
  }
}

/**
 * POST /save
 * Explicitly saves (or regenerates) content for a given business input.
 */
export async function save(input: BusinessInput): Promise<GenerationResult> {
  try {
    const { data } = await api.post<GenerationResult>('/save', input);
    return data;
  } catch (error) {
    throw normaliseError(error);
  }
}

/**
 * GET /health
 * Checks if the backend is reachable. Used for connectivity diagnostics.
 */
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const { data } = await api.get<{ status: string }>('/health');
    return data;
  } catch (error) {
    throw normaliseError(error);
  }
}

export default api;
