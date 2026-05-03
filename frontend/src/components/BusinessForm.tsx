import React, { useState } from 'react';
import type { BusinessInput } from '../types';

interface BusinessFormProps {
  onSubmit: (input: BusinessInput) => void;
  isLoading: boolean;
}

const CATEGORY_OPTIONS = [
  'Salon / Beauty',
  'Restaurant / Cafe',
  'Gym / Fitness',
  'Dentist / Clinic',
  'Bakery',
  'Pharmacy',
  'Boutique / Clothing',
  'Grocery / Supermarket',
  'Law Firm',
  'Accounting / Finance',
  'Real Estate',
  'Photography',
  'Plumbing / Electrician',
  'Yoga Studio',
  'Pet Care',
  'Auto Repair',
  'Hotel / Hospitality',
  'Tutoring / Education',
  'Other',
];

const defaultForm: BusinessInput = {
  businessName: '',
  category: '',
  location: '',
  description: '',
  targetAudience: '',
};

/**
 * Business input form component.
 * Handles validation, loading state, and clean submission.
 */
export const BusinessForm: React.FC<BusinessFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [form, setForm] = useState<BusinessInput>(defaultForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<BusinessInput>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof BusinessInput]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<BusinessInput> = {};
    if (!form.businessName.trim())
      errors.businessName = 'Business name is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.location.trim()) errors.location = 'Location (city) is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      description: form.description?.trim() || undefined,
      targetAudience: form.targetAudience?.trim() || undefined,
    });
  };

  return (
    <form className="business-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {/* Business Name */}
        <div className={`form-group ${fieldErrors.businessName ? 'has-error' : ''}`}>
          <label htmlFor="businessName" className="form-label">
            Business Name <span className="required">*</span>
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            className="form-input"
            placeholder="e.g. Sharma's Hair Studio"
            value={form.businessName}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={200}
          />
          {fieldErrors.businessName && (
            <span className="field-error">{fieldErrors.businessName}</span>
          )}
        </div>

        {/* Category */}
        <div className={`form-group ${fieldErrors.category ? 'has-error' : ''}`}>
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Select a category...</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <span className="field-error">{fieldErrors.category}</span>
          )}
        </div>

        {/* Location */}
        <div className={`form-group ${fieldErrors.location ? 'has-error' : ''}`}>
          <label htmlFor="location" className="form-label">
            Location (City) <span className="required">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="form-input"
            placeholder="e.g. Mumbai, Delhi, Bengaluru"
            value={form.location}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={200}
          />
          {fieldErrors.location && (
            <span className="field-error">{fieldErrors.location}</span>
          )}
        </div>

        {/* Description (optional) */}
        <div className="form-group form-group--full">
          <label htmlFor="description" className="form-label">
            Business Description{' '}
            <span className="optional">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Briefly describe your business, services, or specialties..."
            value={form.description}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
            maxLength={1000}
          />
          <span className="char-count">
            {form.description?.length || 0}/1000
          </span>
        </div>

        {/* Target Audience (optional) */}
        <div className="form-group form-group--full">
          <label htmlFor="targetAudience" className="form-label">
            Target Audience{' '}
            <span className="optional">(optional)</span>
          </label>
          <input
            id="targetAudience"
            name="targetAudience"
            type="text"
            className="form-input"
            placeholder="e.g. Working professionals aged 25-45, young couples, families..."
            value={form.targetAudience}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={500}
          />
        </div>
      </div>

      <button
        id="generate-btn"
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Generating SEO Content…
          </>
        ) : (
          <>
            <span className="btn-icon">✨</span>
            Generate SEO Content
          </>
        )}
      </button>

      {isLoading && (
        <p className="loading-hint">
          Our AI is crafting your keywords, Google Business post, and SEO
          description. This takes about 15–30 seconds…
        </p>
      )}
    </form>
  );
};
