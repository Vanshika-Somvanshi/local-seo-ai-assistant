import { useState, useCallback, useEffect } from 'react';
import { fetchHistory } from '../services/api';
import type {
  HistoryItem,
  PaginationMeta,
  LoadingState,
  APIError,
} from '../types';

interface UseHistoryReturn {
  items: HistoryItem[];
  pagination: PaginationMeta | null;
  status: LoadingState;
  error: APIError | null;
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Reload current page (useful after a new generation) */
  refresh: () => void;
}

/**
 * Custom hook for the GET /history endpoint.
 * Automatically fetches on mount and exposes page navigation + refresh.
 */
export function useHistory(initialLimit = 10): UseHistoryReturn {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<APIError | null>(null);

  const load = useCallback(async (page: number) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetchHistory(page, initialLimit);
      setItems(response.data);
      setPagination(response.pagination);
      setStatus('success');
    } catch (err) {
      setError(err as APIError);
      setStatus('error');
    }
  }, [initialLimit]);

  // Load on mount
  useEffect(() => {
    load(currentPage);
  }, [load, currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refresh = useCallback(() => {
    load(currentPage);
  }, [load, currentPage]);

  return { items, pagination, status, error, goToPage, refresh };
}
