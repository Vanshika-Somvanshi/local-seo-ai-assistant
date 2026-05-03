// ─── Business Input ───────────────────────────────────────────────────────────

/** Form data submitted by the user */
export interface BusinessInput {
  businessName: string;
  category: string;
  location: string;
  description?: string;
  targetAudience?: string;
}

// ─── LLM Output ───────────────────────────────────────────────────────────────

/** Keyword groups generated in Step 1 of the LLM chain */
export interface Keywords {
  /** Purchase-ready keywords (e.g. "best salon in Mumbai") */
  highIntent: string[];
  /** Research-phase keywords (e.g. "how to choose a salon") */
  informational: string[];
}

/** Full structured response from POST /generate or POST /save */
export interface GenerationResult {
  success: boolean;
  projectId: string;
  outputId: string;
  businessName: string;
  category: string;
  location: string;
  keywords: Keywords;
  gmbPost: string;
  seoDescription: string;
  modelName: string;
  promptVersion: string;
  createdAt: string;
}

// ─── History ──────────────────────────────────────────────────────────────────

/** A single project document as returned from the API */
export interface ProjectDoc {
  _id: string;
  businessName: string;
  category: string;
  location: string;
  description?: string;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}

/** A single output document as returned from the API */
export interface OutputDoc {
  _id: string;
  projectId: string;
  keywords: Keywords;
  gmbPost: string;
  seoDescription: string;
  promptVersion: string;
  modelName: string;
  createdAt: string;
  updatedAt: string;
}

/** One history entry pairing a project with its output */
export interface HistoryItem {
  project: ProjectDoc;
  output: OutputDoc;
}

/** Pagination metadata returned alongside history data */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Full GET /history response */
export interface HistoryResponse {
  success: boolean;
  data: HistoryItem[];
  pagination: PaginationMeta;
}

// ─── API Error ────────────────────────────────────────────────────────────────

/** Normalised API error shape */
export interface APIError {
  message: string;
  errors?: string[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Toast notification types */
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
