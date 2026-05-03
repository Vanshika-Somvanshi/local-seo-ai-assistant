import React from 'react';

interface PostSectionProps {
  gmbPost: string;
  onCopy: (text: string, label: string) => void;
}

/**
 * Displays the AI-generated Google Business post with a word count,
 * character count, and copy-to-clipboard button.
 */
export const PostSection: React.FC<PostSectionProps> = ({
  gmbPost,
  onCopy,
}) => {
  const wordCount = gmbPost.trim().split(/\s+/).length;
  const charCount = gmbPost.length;

  return (
    <div className="result-card" id="post-section">
      <div className="result-card__header">
        <div className="result-card__icon result-card__icon--post">📍</div>
        <div>
          <h2 className="result-card__title">Google Business Post</h2>
          <p className="result-card__subtitle">
            {wordCount} words · {charCount} characters · Ready to publish
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm copy-btn"
          onClick={() => onCopy(gmbPost, 'Google Business post')}
          title="Copy post"
        >
          <span>📋</span> Copy
        </button>
      </div>

      <div className="post-content">
        <blockquote className="post-text">{gmbPost}</blockquote>
      </div>

      <div className="post-footer">
        <div className="post-tips">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            Paste this directly into your Google Business Profile under{' '}
            <strong>Posts → Add update</strong>
          </span>
        </div>
        <div className={`word-count-badge ${wordCount >= 100 && wordCount <= 150 ? 'badge--success' : 'badge--warning'}`}>
          {wordCount >= 100 && wordCount <= 150
            ? '✓ Optimal length'
            : wordCount < 100
            ? '⚠ Slightly short'
            : '⚠ Slightly long'}
        </div>
      </div>
    </div>
  );
};
