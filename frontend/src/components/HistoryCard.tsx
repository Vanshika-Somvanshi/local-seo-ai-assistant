import React, { useState } from 'react';
import type { HistoryItem } from '../types';

interface HistoryCardProps {
  item: HistoryItem;
  onCopy: (text: string, label: string) => void;
}

/**
 * Compact history card that shows a past generation.
 * Expandable to reveal full GMB post and SEO description.
 */
export const HistoryCard: React.FC<HistoryCardProps> = ({ item, onCopy }) => {
  const [expanded, setExpanded] = useState(false);
  const { project, output } = item;

  const formattedDate = new Date(output.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalKeywords =
    output.keywords.highIntent.length + output.keywords.informational.length;

  return (
    <div className={`history-card ${expanded ? 'history-card--expanded' : ''}`}>
      {/* Card Header */}
      <div
        className="history-card__header"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)}
      >
        <div className="history-card__meta">
          <div className="history-card__business">
            <span className="history-card__name">{project.businessName}</span>
            <div className="history-card__tags">
              <span className="tag tag--category">{project.category}</span>
              <span className="tag tag--location">📍 {project.location}</span>
            </div>
          </div>
          <div className="history-card__stats">
            <span className="stat">
              <strong>{totalKeywords}</strong> keywords
            </span>
            <span className="stat">
              <strong>{output.gmbPost.split(/\s+/).length}</strong> words post
            </span>
            <span className="stat">{formattedDate}</span>
          </div>
        </div>
        <div className="history-card__chevron">{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div className="history-card__body">
          {/* Keywords Preview */}
          <div className="history-section">
            <div className="history-section__header">
              <h4>🔑 SEO Keywords</h4>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() =>
                  onCopy(
                    [...output.keywords.highIntent, ...output.keywords.informational].join('\n'),
                    'Keywords'
                  )
                }
              >
                Copy all
              </button>
            </div>
            <div className="keyword-pills keyword-pills--compact">
              {output.keywords.highIntent.map((kw, i) => (
                <span key={`hi-${i}`} className="keyword-pill keyword-pill--high keyword-pill--sm">
                  {kw}
                </span>
              ))}
              {output.keywords.informational.map((kw, i) => (
                <span key={`info-${i}`} className="keyword-pill keyword-pill--info keyword-pill--sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* GMB Post */}
          <div className="history-section">
            <div className="history-section__header">
              <h4>📍 Google Business Post</h4>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => onCopy(output.gmbPost, 'GMB Post')}
              >
                Copy
              </button>
            </div>
            <p className="history-post-text">{output.gmbPost}</p>
          </div>

          {/* SEO Description */}
          <div className="history-section">
            <div className="history-section__header">
              <h4>📝 SEO Description</h4>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => onCopy(output.seoDescription, 'SEO Description')}
              >
                Copy
              </button>
            </div>
            <p className="history-desc-text">{output.seoDescription}</p>
          </div>

          {/* Footer metadata */}
          <div className="history-card__footer">
            <span className="meta-tag">Model: {output.modelName}</span>
            <span className="meta-tag">Prompt: {output.promptVersion}</span>
          </div>
        </div>
      )}
    </div>
  );
};
