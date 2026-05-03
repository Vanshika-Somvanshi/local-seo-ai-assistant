import mongoose, { Document, Schema } from 'mongoose';

/**
 * Project document interface.
 * Represents a single business whose SEO content is being generated.
 */
export interface IProject extends Document {
  businessName: string;
  category: string;
  location: string;
  description?: string;
  targetAudience?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    targetAudience: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    // Automatically manage createdAt and updatedAt
    timestamps: true,
    // Return lean objects with virtuals for better performance
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ businessName: 'text', category: 'text', location: 'text' });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
