import React from 'react';

/**
 * Skeleton loading placeholders for the three result cards.
 * Shown while the LLM is generating content.
 */
export const SkeletonLoader: React.FC = () => {
  return (
    <div className="skeleton-wrapper" aria-busy="true" aria-label="Generating content">
      {/* Keywords skeleton */}
      <div className="result-card skeleton-card">
        <div className="result-card__header">
          <div className="skeleton skeleton--circle" />
          <div className="skeleton-header-text">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--subtitle" />
          </div>
        </div>
        <div className="skeleton-pills">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton--pill"
              style={{ width: `${60 + Math.random() * 80}px` }}
            />
          ))}
        </div>
      </div>

      {/* GMB Post skeleton */}
      <div className="result-card skeleton-card">
        <div className="result-card__header">
          <div className="skeleton skeleton--circle" />
          <div className="skeleton-header-text">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--subtitle" />
          </div>
        </div>
        <div className="skeleton-lines">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton--line"
              style={{ width: i === 4 ? '60%' : '100%' }}
            />
          ))}
        </div>
      </div>

      {/* SEO Description skeleton */}
      <div className="result-card skeleton-card">
        <div className="result-card__header">
          <div className="skeleton skeleton--circle" />
          <div className="skeleton-header-text">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--subtitle" />
          </div>
        </div>
        <div className="skeleton-lines">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton--line"
              style={{ width: i === 6 ? '45%' : i === 3 ? '80%' : '100%' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
