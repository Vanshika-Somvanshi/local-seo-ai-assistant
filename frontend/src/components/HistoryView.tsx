import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { HistoryCard } from './HistoryCard';
import { EmptyState } from './EmptyState';

interface HistoryViewProps {
  onCopy: (text: string, label: string) => void;
  /** Trigger a refresh from the parent (e.g. after a new generation) */
  refreshKey?: number;
}

/**
 * Full history view with pagination and loading/error/empty states.
 */
export const HistoryView: React.FC<HistoryViewProps> = ({ onCopy, refreshKey }) => {
  const { items, pagination, status, error, goToPage, refresh } = useHistory(8);

  // Refresh when the parent signals a new generation was saved
  React.useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      refresh();
    }
  }, [refreshKey, refresh]);

  return (
    <section className="history-section-wrapper" id="history-view">
      <div className="section-header">
        <div className="section-header__left">
          <h2 className="section-title">Generation History</h2>
          <p className="section-subtitle">
            Previous SEO content generations — click any card to expand
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={refresh}
          disabled={status === 'loading'}
          title="Refresh history"
        >
          {status === 'loading' ? '⟳ Refreshing…' : '⟳ Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {status === 'loading' && items.length === 0 && (
        <div className="history-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="error-banner" role="alert">
          <span>⚠️</span>
          <span>{error?.message || 'Failed to load history'}</span>
          <button className="btn btn-ghost btn-sm" onClick={refresh}>
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {status === 'success' && items.length === 0 && (
        <EmptyState
          icon="🗂️"
          title="No generations yet"
          description="Your SEO content generations will appear here. Fill in the form above and hit Generate!"
        />
      )}

      {/* History List */}
      {items.length > 0 && (
        <>
          <div className="history-list">
            {items.map((item) => (
              <HistoryCard
                key={item.output._id}
                item={item}
                onCopy={onCopy}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || status === 'loading'}
              >
                ← Previous
              </button>

              <div className="pagination__pages">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`pagination__page ${pagination.page === pageNum ? 'pagination__page--active' : ''}`}
                      onClick={() => goToPage(pageNum)}
                      disabled={pagination.page === pageNum || status === 'loading'}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!pagination.hasNextPage || status === 'loading'}
              >
                Next →
              </button>
            </div>
          )}

          {pagination && (
            <p className="history-count">
              Showing {items.length} of {pagination.total} generations
            </p>
          )}
        </>
      )}
    </section>
  );
};
