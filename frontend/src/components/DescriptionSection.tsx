import React from 'react';

interface DescriptionSectionProps {
  seoDescription: string;
  onCopy: (text: string, label: string) => void;
}

/**
 * Displays the AI-generated SEO business description.
 * Renders paragraphs individually for better readability.
 */
export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  seoDescription,
  onCopy,
}) => {
  // Split into paragraphs for clean rendering
  const paragraphs = seoDescription
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = seoDescription.trim().split(/\s+/).length;

  return (
    <div className="result-card" id="description-section">
      <div className="result-card__header">
        <div className="result-card__icon result-card__icon--desc">📝</div>
        <div>
          <h2 className="result-card__title">SEO Business Description</h2>
          <p className="result-card__subtitle">
            {paragraphs.length} paragraph{paragraphs.length !== 1 ? 's' : ''} ·{' '}
            {wordCount} words · Optimised for Google
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm copy-btn"
          onClick={() => onCopy(seoDescription, 'SEO description')}
          title="Copy description"
        >
          <span>📋</span> Copy
        </button>
      </div>

      <div className="description-content">
        {paragraphs.map((para, i) => (
          <p key={i} className="description-paragraph">
            {para}
          </p>
        ))}
      </div>

      <div className="description-footer">
        <div className="usage-tags">
          <span className="usage-tag">✓ Google Business Profile</span>
          <span className="usage-tag">✓ Website About Page</span>
          <span className="usage-tag">✓ Local Directories</span>
        </div>
      </div>
    </div>
  );
};
