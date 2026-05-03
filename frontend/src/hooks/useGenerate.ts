import { useState, useCallback } from 'react';
import { generate } from '../services/api';
import type { BusinessInput, GenerationResult, LoadingState, APIError } from '../types';

interface UseGenerateReturn {
  /** The latest generation result, or null if not yet generated */
  result: GenerationResult | null;
  /** Current loading state */
  status: LoadingState;
  /** Error object if status === 'error' */
  error: APIError | null;
  /** Trigger a new generation */
  run: (input: BusinessInput) => Promise<void>;
  /** Reset result, status, and error to initial state */
  reset: () => void;
}

/**
 * Custom hook that manages the full lifecycle of a /generate API call:
 *  - idle → loading → success / error
 *  - Provides the result and error in a typed, consistent shape
 */
export function useGenerate(): UseGenerateReturn {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<APIError | null>(null);

  const run = useCallback(async (input: BusinessInput) => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const data = await generate(input);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setError(err as APIError);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setStatus('idle');
    setError(null);
  }, []);

  return { result, status, error, run, reset };
}
