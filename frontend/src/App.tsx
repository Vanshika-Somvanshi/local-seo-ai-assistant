import React, { useCallback, useState } from 'react';
import { BusinessForm } from './components/BusinessForm';
import { KeywordsSection } from './components/KeywordsSection';
import { PostSection } from './components/PostSection';
import { DescriptionSection } from './components/DescriptionSection';
import { SkeletonLoader } from './components/SkeletonLoader';
import { HistoryView } from './components/HistoryView';
import { ToastContainer } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { useGenerate } from './hooks/useGenerate';
import { useToast } from './hooks/useToast';
import type { BusinessInput } from './types';

/**
 * Root application component.
 *
 * Layout:
 *  ┌─────────────────────────────────────┐
 *  │  Header (logo + tagline)            │
 *  ├────────────────┬────────────────────┤
 *  │  Input Form    │  Results Panel     │
 *  │  (left)        │  (right, 3 cards)  │
 *  ├────────────────┴────────────────────┤
 *  │  History Section (full width)       │
 *  └─────────────────────────────────────┘
 */
const App: React.FC = () => {
  const { result, status, error, run, reset } = useGenerate();
  const { toasts, addToast, removeToast } = useToast();

  // Incremented to trigger HistoryView refresh after a new generation
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (input: BusinessInput) => {
      await run(input);
      // Refresh history after generation completes
      setHistoryRefreshKey((k) => k + 1);
    },
    [run]
  );

  const handleCopy = useCallback(
    (text: string, label: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => addToast(`${label} copied to clipboard!`, 'success'))
        .catch(() => addToast('Failed to copy to clipboard', 'error'));
    },
    [addToast]
  );

  const handleRegenerate = useCallback(() => {
    reset();
    // Scroll back to the form
    document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
  }, [reset]);

  // Notify user of errors via toast
  React.useEffect(() => {
    if (status === 'error' && error) {
      addToast(error.message, 'error');
    }
  }, [status, error, addToast]);

  // Notify on success
  React.useEffect(() => {
    if (status === 'success') {
      addToast('SEO content generated and saved!', 'success');
    }
  }, [status, addToast]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-icon">🚀</span>
              <div>
                <h1 className="logo-title">GrowthPro AI</h1>
                <p className="logo-tagline">Local SEO Assistant for Small Businesses</p>
              </div>
            </div>
            <div className="header-badges">
              <span className="badge badge--ai">AI-Powered</span>
              <span className="badge badge--steps">3-Step Generation</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="app-main">
        <div className="container">
          <div className="main-grid">
            {/* Left column — Input Form */}
            <section className="input-panel" id="input-section">
              <div className="panel-header">
                <h2 className="panel-title">Business Details</h2>
                <p className="panel-subtitle">
                  Tell us about your business and we'll generate SEO content
                  tailored to your location and category.
                </p>
              </div>

              <BusinessForm
                onSubmit={handleSubmit}
                isLoading={status === 'loading'}
              />

              {/* How it works */}
              <div className="how-it-works">
                <h3>How it works</h3>
                <ol className="steps-list">
                  <li>
                    <span className="step-num">1</span>
                    <span>AI generates <strong>SEO keywords</strong> for your location & category</span>
                  </li>
                  <li>
                    <span className="step-num">2</span>
                    <span>Keywords feed into a <strong>Google Business post</strong></span>
                  </li>
                  <li>
                    <span className="step-num">3</span>
                    <span>Everything combines into a <strong>SEO description</strong></span>
                  </li>
                </ol>
              </div>
            </section>

            {/* Right column — Results */}
            <section className="results-panel" id="results-section">
              {/* Idle state */}
              {status === 'idle' && (
                <EmptyState
                  icon="✨"
                  title="Ready to generate"
                  description="Fill in your business details on the left and click Generate to get AI-powered SEO content tailored to your local market."
                />
              )}

              {/* Loading state — skeleton cards */}
              {status === 'loading' && <SkeletonLoader />}

              {/* Error state */}
              {status === 'error' && error && (
                <div className="error-state" role="alert">
                  <div className="error-state__icon">⚠️</div>
                  <h3 className="error-state__title">Generation Failed</h3>
                  <p className="error-state__message">{error.message}</p>
                  {error.errors && error.errors.length > 0 && (
                    <ul className="error-list">
                      {error.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                  <button className="btn btn-primary" onClick={() => reset()}>
                    Try Again
                  </button>
                </div>
              )}

              {/* Success state — 3 result cards */}
              {status === 'success' && result && (
                <div className="results-content">
                  <div className="results-header">
                    <div>
                      <h2 className="results-title">
                        SEO content for{' '}
                        <span className="highlight">{result.businessName}</span>
                      </h2>
                      <p className="results-meta">
                        Generated with {result.modelName} · {result.promptVersion} ·{' '}
                        {new Date(result.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleRegenerate}
                    >
                      ↩ New Business
                    </button>
                  </div>

                  <KeywordsSection
                    keywords={result.keywords}
                    onCopy={handleCopy}
                  />
                  <PostSection
                    gmbPost={result.gmbPost}
                    onCopy={handleCopy}
                  />
                  <DescriptionSection
                    seoDescription={result.seoDescription}
                    onCopy={handleCopy}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Full-width History Section */}
          <div className="history-divider">
            <span>Past Generations</span>
          </div>
          <HistoryView
            onCopy={handleCopy}
            refreshKey={historyRefreshKey}
          />
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="app-footer">
        <div className="container">
          <p>
            GrowthPro AI · Local SEO Assistant · Powered by OpenAI GPT-4o-mini
          </p>
        </div>
      </footer>

      {/* ── Toast Notifications ──────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
