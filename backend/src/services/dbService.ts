import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { Output, IOutput, IKeywords } from '../models/Output';
import { GenerateInput } from '../validators/generateSchema';
import { GenerationResult } from './llmService';

// ─── Connection ───────────────────────────────────────────────────────────────

/**
 * Establish a MongoDB connection. Mongoose connection pooling ensures
 * we reuse the existing connection on subsequent calls.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (mongoose.connection.readyState === 1) {
    // Already connected — nothing to do
    return;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  console.log('[DB] Connected to MongoDB Atlas ✓');

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });
}

// ─── Project Operations ───────────────────────────────────────────────────────

/**
 * Create a new project document from the business input form.
 */
export async function createProject(input: GenerateInput): Promise<IProject> {
  const project = new Project({
    businessName: input.businessName,
    category: input.category,
    location: input.location,
    description: input.description,
    targetAudience: input.targetAudience,
  });
  return project.save();
}

/**
 * Find a project by its MongoDB ObjectId.
 */
export async function findProjectById(
  projectId: string
): Promise<IProject | null> {
  return Project.findById(projectId);
}

// ─── Output Operations ────────────────────────────────────────────────────────

/**
 * Save an AI-generated output linked to a project.
 */
export async function saveOutput(
  projectId: string,
  result: GenerationResult
): Promise<IOutput> {
  const output = new Output({
    projectId,
    keywords: result.keywords,
    gmbPost: result.gmbPost,
    seoDescription: result.seoDescription,
    promptVersion: result.promptVersion,
    modelName: result.modelName,
  });
  return output.save();
}

/**
 * Save a project and its output in a single logical operation.
 * Returns both the project and output documents.
 */
export async function createProjectAndOutput(
  input: GenerateInput,
  result: GenerationResult
): Promise<{ project: IProject; output: IOutput }> {
  const project = await createProject(input);
  const output = await saveOutput(String(project._id), result);
  return { project, output };
}

// ─── History Operations ───────────────────────────────────────────────────────

export interface HistoryItem {
  project: IProject;
  output: IOutput;
}

export interface HistoryResult {
  data: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Retrieve paginated generation history, sorted newest first.
 * Each item includes the full project and output documents joined together.
 */
export async function getHistory(
  page = 1,
  limit = 10
): Promise<HistoryResult> {
  // Clamp pagination values to safe ranges
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  // Efficient aggregation pipeline: sort outputs, paginate, then lookup projects
  const [outputs, totalDocs] = await Promise.all([
    Output.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate<{ projectId: IProject }>('projectId')
      .lean(),
    Output.countDocuments(),
  ]);

  // Shape the results into { project, output } pairs
  const data: HistoryItem[] = outputs
    .filter((o) => o.projectId !== null) // guard against orphaned outputs
    .map((o) => ({
      project: o.projectId as unknown as IProject,
      output: o as unknown as IOutput,
    }));

  return {
    data,
    total: totalDocs,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(totalDocs / safeLimit),
  };
}

// ─── Save Operation ───────────────────────────────────────────────────────────

/**
 * Explicitly save (or re-save) a generation result given a projectId.
 * Used by POST /save for explicit persistence after generation.
 */
export async function saveExplicit(
  projectId: string,
  keywords: IKeywords,
  gmbPost: string,
  seoDescription: string,
  modelName: string,
  promptVersion: string
): Promise<IOutput> {
  const output = new Output({
    projectId,
    keywords,
    gmbPost,
    seoDescription,
    modelName,
    promptVersion,
  });
  return output.save();
}
