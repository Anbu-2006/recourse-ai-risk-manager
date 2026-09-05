import { Groq } from "groq-sdk";

export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    return null;
  }
  return new Groq({ apiKey });
}

export async function createGroqChatCompletion(options: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  response_format?: { type: "json_object" | "text" };
  temperature?: number;
}): Promise<string | null> {
  const groq = getGroqClient();
  if (!groq) return null;

  const candidateModels = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
  ].filter(Boolean) as string[];

  for (const model of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: options.messages,
        response_format: options.response_format,
        temperature: options.temperature ?? 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (err: any) {
      // If model not found, try next candidate
      if (err?.status === 404 || err?.message?.includes("does not exist") || err?.code === "model_not_found") {
        continue;
      }
      console.warn(`Groq error with model ${model}:`, err.message);
    }
  }

  return null;
}
