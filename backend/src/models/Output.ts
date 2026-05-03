import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Keywords structure returned by Step 1 of the LLM chain.
 */
export interface IKeywords {
  /** Purchase-ready keywords, e.g. "best salon in Patna" */
  highIntent: string[];
  /** Research-phase keywords, e.g. "how to choose a salon" */
  informational: string[];
}

/**
 * Output document interface.
 * Stores the full AI-generated SEO content linked to a Project.
 */
export interface IOutput extends Document {
  projectId: Types.ObjectId;
  keywords: IKeywords;
  gmbPost: string;
  seoDescription: string;
  /** Versioning for prompt tracking, e.g. "v1.0" */
  promptVersion: string;
  /** LLM model used, e.g. "gpt-4o-mini" */
  modelName: string;
  createdAt: Date;
  updatedAt: Date;
}

const KeywordsSchema = new Schema<IKeywords>(
  {
    highIntent: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'highIntent keywords array cannot be empty',
      },
    },
    informational: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'informational keywords array cannot be empty',
      },
    },
  },
  { _id: false } // Embedded subdocument — no separate _id needed
);

const OutputSchema = new Schema<IOutput>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    keywords: {
      type: KeywordsSchema,
      required: true,
    },
    gmbPost: {
      type: String,
      required: true,
      trim: true,
    },
    seoDescription: {
      type: String,
      required: true,
      trim: true,
    },
    promptVersion: {
      type: String,
      required: true,
      default: 'v1.0',
    },
    modelName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Sort newest first by default
OutputSchema.index({ createdAt: -1 });
// Lookup outputs by projectId efficiently
OutputSchema.index({ projectId: 1, createdAt: -1 });

export const Output = mongoose.model<IOutput>('Output', OutputSchema);
