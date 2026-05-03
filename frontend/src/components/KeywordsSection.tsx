import React from 'react';
import type { Keywords } from '../types';

interface KeywordsSectionProps {
  keywords: Keywords;
  onCopy: (text: string, label: string) => void;
}

/**
 * Displays the two keyword groups (high-intent and informational)
 * as pill-style tags with individual copy-to-clipboard buttons.
 */
export const KeywordsSection: React.FC<KeywordsSectionProps> = ({
  keywords,
  onCopy,
}) => {
  const allKeywords = [
    ...keywords.highIntent,
    ...keywords.informational,
  ].join('\n');

  return (
    <div className="result-card" id="keywords-section">
      <div className="result-card__header">
        <div className="result-card__icon result-card__icon--keywords">🔑</div>
        <div>
          <h2 className="result-card__title">SEO Keywords</h2>
          <p className="result-card__subtitle">
            {keywords.highIntent.length + keywords.informational.length} keywords
            across 2 intent groups
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm copy-btn"
          onClick={() => onCopy(allKeywords, 'All keywords')}
          title="Copy all keywords"
        >
          <span>📋</span> Copy All
        </button>
      </div>

      <div className="keywords-groups">
        {/* High Intent Group */}
        <div className="keyword-group">
          <div className="keyword-group__header">
            <span className="keyword-badge keyword-badge--high">High Intent</span>
            <span className="keyword-group__count">
              {keywords.highIntent.length} keywords
            </span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() =>
                onCopy(keywords.highIntent.join('\n'), 'High intent keywords')
              }
            >
              Copy
            </button>
          </div>
          <p className="keyword-group__description">
            Purchase-ready — users searching to buy or book
          </p>
          <div className="keyword-pills">
            {keywords.highIntent.map((kw, i) => (
              <button
                key={i}
                className="keyword-pill keyword-pill--high"
                onClick={() => onCopy(kw, `"${kw}"`)}
                title={`Click to copy: ${kw}`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Informational Group */}
        <div className="keyword-group">
          <div className="keyword-group__header">
            <span className="keyword-badge keyword-badge--info">Informational</span>
            <span className="keyword-group__count">
              {keywords.informational.length} keywords
            </span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() =>
                onCopy(
                  keywords.informational.join('\n'),
                  'Informational keywords'
                )
              }
            >
              Copy
            </button>
          </div>
          <p className="keyword-group__description">
            Research-phase — users exploring and comparing options
          </p>
          <div className="keyword-pills">
            {keywords.informational.map((kw, i) => (
              <button
                key={i}
                className="keyword-pill keyword-pill--info"
                onClick={() => onCopy(kw, `"${kw}"`)}
                title={`Click to copy: ${kw}`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
