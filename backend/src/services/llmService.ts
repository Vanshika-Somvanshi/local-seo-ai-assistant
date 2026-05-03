import OpenAI from 'openai';
import { IKeywords } from '../models/Output';
import { GenerateInput } from '../validators/generateSchema';
import {
  safeParseJSON,
  assertKeys,
  ensureStringArray,
  JSONRepairError,
} from '../utils/jsonRepair';

// ─── Prompt Version ───────────────────────────────────────────────────────────
// Bump this string whenever you modify any prompt below so history records
// which version of the prompt produced each generation.
export const PROMPT_VERSION = 'v1.0';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerationResult {
  keywords: IKeywords;
  gmbPost: string;
  seoDescription: string;
  modelName: string;
  promptVersion: string;
}

// ─── LLM Provider Config ─────────────────────────────────────────────────────
// Supports openai | deepseek | groq via LLM_PROVIDER in .env.
// All three use the OpenAI-compatible SDK — only the baseURL + key differs.

interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  /** Groq does not support response_format: json_object for all models */
  supportsJsonMode: boolean;
}

const PROVIDER_DEFAULTS: Record<string, Omit<ProviderConfig, 'apiKey'>> = {
  openai: {
    model: 'gpt-4o-mini',
    supportsJsonMode: true,
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    supportsJsonMode: true,
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    supportsJsonMode: true,
  },
};

function getProviderConfig(): ProviderConfig {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error('LLM_API_KEY is not set in your .env file.');
  }

  const defaults = PROVIDER_DEFAULTS[provider] ?? PROVIDER_DEFAULTS['openai'];

  return { apiKey, ...defaults };
}

function buildClient(config: ProviderConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });
}
// ─── Helper: Call LLM ────────────────────────────────────────────────────────

/**
 * Send a single prompt to the LLM and return the raw text response.
 * Uses JSON mode when the provider supports it; otherwise adds a JSON
 * instruction to the system prompt.
 */
async function callLLM(
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  supportsJsonMode: boolean
): Promise<string> {
  const effectiveSystem = supportsJsonMode
    ? systemPrompt
    : `${systemPrompt}\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no explanation, just the JSON object.`;

  const response = await client.chat.completions.create({
    model,
    stream: false,
    messages: [
      { role: 'system', content: effectiveSystem },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    ...(supportsJsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('LLM returned an empty response');
  }
  return content;
}

// ─── Step 1: Generate Keywords ────────────────────────────────────────────────

/**
 * Step 1 of the SEO generation chain.
 * Generates 10-15 SEO keywords split into high-intent and informational buckets.
 */
async function generateKeywords(
  client: OpenAI,
  model: string,
  input: GenerateInput,
  supportsJsonMode: boolean
): Promise<IKeywords> {
  const systemPrompt = `You are an expert local SEO strategist with 10+ years of experience helping small businesses rank on Google. You produce precise, location-specific keyword lists that drive real organic traffic.`;

  const userPrompt = `Generate a comprehensive local SEO keyword list for the following business:

Business Name: ${input.businessName}
Category: ${input.category}
Location: ${input.location}
${input.description ? `Description: ${input.description}` : ''}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}

Rules:
- Generate exactly 5-8 HIGH INTENT keywords (purchase-ready, e.g. "best ${input.category} in ${input.location}", "affordable ${input.category} near me")
- Generate exactly 5-7 INFORMATIONAL keywords (research-phase, e.g. "how to choose a ${input.category}", "what to look for in a ${input.category}")
- Keywords must be specific to ${input.location} and the ${input.category} category
- Include long-tail variations and question-based keywords
- Do NOT include generic keywords — all must be local and relevant

Return ONLY this exact JSON structure with no extra text:
{
  "highIntent": ["keyword1", "keyword2", ...],
  "informational": ["keyword1", "keyword2", ...]
}`;

  const raw = await callLLM(client, model, systemPrompt, userPrompt, supportsJsonMode);
  const parsed = safeParseJSON<{ highIntent: unknown; informational: unknown }>(raw);

  assertKeys(parsed, ['highIntent', 'informational']);

  return {
    highIntent: ensureStringArray(parsed.highIntent),
    informational: ensureStringArray(parsed.informational),
  };
}

// ─── Step 2: Generate Google Business Post ────────────────────────────────────

/**
 * Step 2 of the SEO generation chain.
 * Uses Step 1 keywords to craft a ready-to-publish Google Business post.
 */
async function generateGMBPost(
  client: OpenAI,
  model: string,
  input: GenerateInput,
  keywords: IKeywords,
  supportsJsonMode: boolean
): Promise<string> {
  const allKeywords = [...keywords.highIntent, ...keywords.informational].join(', ');

  const systemPrompt = `You are a Google Business Profile specialist and local marketing expert. You write compelling, SEO-optimised posts that attract local customers and drive foot traffic or inquiries.`;

  const userPrompt = `Write a Google Business post for the following business using the provided SEO keywords naturally:

Business Name: ${input.businessName}
Category: ${input.category}
Location: ${input.location}
${input.description ? `Description: ${input.description}` : ''}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}

SEO Keywords to incorporate naturally: ${allKeywords}

Requirements:
- Length: exactly 100-150 words
- Tone: professional yet friendly and approachable
- Include a clear call-to-action at the end (e.g. "Visit us today", "Call now", "Book your appointment")
- Naturally weave in 3-5 of the provided keywords — do NOT keyword-stuff
- Mention the location (${input.location}) at least once
- Make it feel human and authentic, not robotic

Return ONLY this exact JSON structure:
{
  "gmbPost": "Your complete Google Business post here..."
}`;

  const raw = await callLLM(client, model, systemPrompt, userPrompt, supportsJsonMode);
  const parsed = safeParseJSON<{ gmbPost: unknown }>(raw);
  assertKeys(parsed, ['gmbPost']);

  if (typeof parsed.gmbPost !== 'string' || parsed.gmbPost.trim().length === 0) {
    throw new JSONRepairError('gmbPost field is empty or not a string', raw);
  }

  return parsed.gmbPost.trim();
}

// ─── Step 3: Generate SEO Description ────────────────────────────────────────

/**
 * Step 3 (final) of the SEO generation chain.
 * Uses all prior inputs + outputs to produce a 2-3 paragraph SEO description
 * suitable for a Google Business Profile or landing page.
 */
async function generateSEODescription(
  client: OpenAI,
  model: string,
  input: GenerateInput,
  keywords: IKeywords,
  gmbPost: string,
  supportsJsonMode: boolean
): Promise<string> {
  const highIntentStr = keywords.highIntent.join(', ');
  const informationalStr = keywords.informational.join(', ');

  const systemPrompt = `You are a senior SEO copywriter specialising in local business content. You craft persuasive, keyword-rich descriptions that rank well on Google and convert visitors into customers.`;

  const userPrompt = `Write a 2-3 paragraph SEO-friendly business description for the following business:

Business Name: ${input.businessName}
Category: ${input.category}
Location: ${input.location}
${input.description ? `Business Details: ${input.description}` : ''}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}

High-Intent Keywords (must include several naturally): ${highIntentStr}
Informational Keywords (include 2-3): ${informationalStr}

Context from their Google Business post:
"${gmbPost}"

Requirements:
- 2-3 paragraphs, approximately 150-200 words total
- Paragraph 1: Introduce the business, its specialty, and location
- Paragraph 2: Highlight key services or unique selling points
- Paragraph 3: Customer-focused closing with a call-to-action
- Naturally incorporate high-intent and informational keywords throughout
- Write in third person (e.g. "XYZ Salon is...")
- Avoid fluff; every sentence must add value
- This description will appear on their Google Business Profile and website

Return ONLY this exact JSON structure:
{
  "seoDescription": "Full 2-3 paragraph description here..."
}`;

  const raw = await callLLM(client, model, systemPrompt, userPrompt, supportsJsonMode);
  const parsed = safeParseJSON<{ seoDescription: unknown }>(raw);
  assertKeys(parsed, ['seoDescription']);

  if (
    typeof parsed.seoDescription !== 'string' ||
    parsed.seoDescription.trim().length === 0
  ) {
    throw new JSONRepairError('seoDescription field is empty or not a string', raw);
  }

  return parsed.seoDescription.trim();
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Orchestrates the full 3-step SEO content generation chain:
 *   1. Generate SEO keywords
 *   2. Use keywords → Generate Google Business post
 *   3. Use input + keywords + post → Generate SEO description
 *
 * Each step builds on the previous for coherent, keyword-consistent content.
 * JSON mode is used where supported; Groq uses a system-prompt fallback.
 */
export async function generateSEOContent(
  input: GenerateInput
): Promise<GenerationResult> {
  const config = getProviderConfig();
  const client = buildClient(config);
  const model = config.model;
  const supportsJsonMode = config.supportsJsonMode;

  const provider = process.env.LLM_PROVIDER || 'openai';
  console.log(`[LLM] Provider: ${provider} | Model: ${model}`);
  console.log(`[LLM] Starting 3-step generation for "${input.businessName}"`);

  // ── Step 1: Keywords ────────────────────────────────────────────────────────
  console.log('[LLM] Step 1: Generating keywords...');
  const keywords = await generateKeywords(client, model, input, supportsJsonMode);
  console.log(
    `[LLM] Step 1 complete — ${keywords.highIntent.length} high-intent, ${keywords.informational.length} informational keywords`
  );

  // ── Step 2: GMB Post ────────────────────────────────────────────────────────
  console.log('[LLM] Step 2: Generating Google Business post...');
  const gmbPost = await generateGMBPost(client, model, input, keywords, supportsJsonMode);
  console.log(`[LLM] Step 2 complete — post length: ${gmbPost.length} chars`);

  // ── Step 3: SEO Description ─────────────────────────────────────────────────
  console.log('[LLM] Step 3: Generating SEO description...');
  const seoDescription = await generateSEODescription(
    client,
    model,
    input,
    keywords,
    gmbPost,
    supportsJsonMode
  );
  console.log(`[LLM] Step 3 complete — description length: ${seoDescription.length} chars`);

  console.log('[LLM] All 3 steps complete ✓');

  return {
    keywords,
    gmbPost,
    seoDescription,
    modelName: model,
    promptVersion: PROMPT_VERSION,
  };
}
