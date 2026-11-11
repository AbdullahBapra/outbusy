import { anthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { createGoogle, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { APICallError, type LanguageModel, type streamText } from "ai";

type ProviderOptions = NonNullable<Parameters<typeof streamText>[0]["providerOptions"]>;
type GoogleModel = ReturnType<ReturnType<typeof createGoogle>>;

/**
 * Chat model selection. The owner picks a model in Admin → Settings; if that provider has no
 * API key, the assistant falls back to whichever provider is configured.
 *  - Gemini: GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY)
 *  - Claude: ANTHROPIC_API_KEY
 */

const real = (v: string | undefined) => Boolean(v && !v.startsWith("<"));
const geminiKey = () => [process.env.GEMINI_API_KEY, process.env.GOOGLE_GENERATIVE_AI_API_KEY].find(real);

export const hasGemini = () => Boolean(geminiKey());
export const hasClaude = () => real(process.env.ANTHROPIC_API_KEY);
export const isChatEnabled = () => hasGemini() || hasClaude();

const isGemini = (id: string) => id.startsWith("gemini-");
export const DEFAULT_GEMINI = "gemini-3.5-flash";
/** Tried in order when the chosen Gemini model is overloaded or out of quota. */
const GEMINI_FALLBACKS = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];

let google: ReturnType<typeof createGoogle> | null = null;

/** Overloaded, rate-limited or a server error: worth trying another model. */
const isTransient = (err: unknown) => APICallError.isInstance(err) && [429, 500, 502, 503, 504].includes(err.statusCode ?? 0);

/**
 * A model that tries each Gemini model in turn until one accepts the request. Failover only
 * happens before a response starts, so a reply is never stitched together from two models.
 */
function withFallback(models: GoogleModel[]): GoogleModel {
  const first = models[0];
  const attempt = async <T,>(call: (m: GoogleModel) => PromiseLike<T>): Promise<T> => {
    let lastError: unknown;
    for (const m of models) {
      try {
        return await call(m);
      } catch (err) {
        lastError = err;
        if (!isTransient(err)) throw err;
        console.warn(`[chat] ${m.modelId} unavailable (${(err as APICallError).statusCode}), trying the next model`);
      }
    }
    throw lastError;
  };
  return {
    specificationVersion: first.specificationVersion,
    provider: first.provider,
    modelId: first.modelId,
    supportedUrls: first.supportedUrls,
    doGenerate: (options) => attempt((m) => m.doGenerate(options)),
    doStream: (options) => attempt((m) => m.doStream(options)),
  };
}

export function resolveChatModel(preferred: string): { id: string; model: LanguageModel; providerOptions: ProviderOptions } {
  const id =
    isGemini(preferred) && hasGemini() ? preferred : !isGemini(preferred) && hasClaude() ? preferred : hasGemini() ? DEFAULT_GEMINI : "claude-opus-5-5";

  if (isGemini(id)) {
    google ??= createGoogle({ apiKey: geminiKey() });
    const chain = [id, ...GEMINI_FALLBACKS.filter((m) => m !== id)].map((m) => google!(m));
    // Light thinking keeps replies quick; chat answers are short and grounded in retrieved text.
    // Gemini 3+ takes a thinking level; Gemini 2.5 takes a token budget.
    const thinkingConfig = id.startsWith("gemini-2.") ? { thinkingBudget: 512 } : { thinkingLevel: "low" as const };
    return { id, model: withFallback(chain), providerOptions: { google: { thinkingConfig } satisfies GoogleLanguageModelOptions } };
  }
  return { id, model: anthropic(id), providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions } };
}
