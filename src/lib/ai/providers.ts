import {buildDiagramPrompt, stripMermaidFences, type AiDiagramRequest} from "./prompts";

export type AiProviderResult = {
  provider: "gemini" | "deepseek";
  code: string;
};

export type AiProviderError = {
  provider: "gemini" | "deepseek";
  status?: number;
  message: string;
};

export async function generateDiagramWithFallback(input: AiDiagramRequest): Promise<{
  result?: AiProviderResult;
  errors: AiProviderError[];
}> {
  const errors: AiProviderError[] = [];

  try {
    const result = await generateWithGemini(input);
    if (result.code) return {result, errors};
  } catch (error) {
    errors.push(normalizeProviderError("gemini", error));
  }

  try {
    const result = await generateWithDeepSeek(input);
    if (result.code) return {result, errors};
  } catch (error) {
    errors.push(normalizeProviderError("deepseek", error));
  }

  return {errors};
}

async function generateWithGemini(input: AiDiagramRequest): Promise<AiProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ProviderError("Gemini API key is not configured.");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = buildDiagramPrompt(input);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{text: prompt}]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 1800
      }
    })
  });

  if (!response.ok) {
    throw new ProviderError(await response.text(), response.status);
  }

  const data = (await response.json()) as {
    candidates?: Array<{content?: {parts?: Array<{text?: string}>}}>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
  const code = stripMermaidFences(text);

  if (!code) throw new ProviderError("Gemini returned an empty response.");
  return {provider: "gemini", code};
}

async function generateWithDeepSeek(input: AiDiagramRequest): Promise<AiProviderResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new ProviderError("DeepSeek API key is not configured.");

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const endpoint = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions";
  const prompt = buildDiagramPrompt(input);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a diagram generation assistant. Return only valid diagram source code."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new ProviderError(await response.text(), response.status);
  }

  const data = (await response.json()) as {
    choices?: Array<{message?: {content?: string}}>;
  };
  const code = stripMermaidFences(data.choices?.[0]?.message?.content || "");

  if (!code) throw new ProviderError("DeepSeek returned an empty response.");
  return {provider: "deepseek", code};
}

function normalizeProviderError(provider: AiProviderError["provider"], error: unknown): AiProviderError {
  if (error instanceof ProviderError) {
    return {
      provider,
      status: error.status,
      message: error.message
    };
  }

  return {
    provider,
    message: error instanceof Error ? error.message : "Unknown provider error."
  };
}

class ProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}
