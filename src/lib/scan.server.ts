import { callAI, parseJsonBlock } from "./ai.server";
import {
  defaultRecommendations,
  detectType,
  labelForType,
  riskFromScore,
  runHeuristics,
  type ScanResult,
  type ScanType,
} from "./scan-engine";

const SYSTEM = `You are Scanovix AI, an expert cybersecurity analyst that detects scams, phishing and fake content.
Reply ONLY with compact JSON:
{"trustScore":0-100,"confidence":0-100,"indicators":["Phishing"|"Scam"|"Fake Website"|"Suspicious Domain"|"Spam"|"Safe"],"explanation":["short reason", "..."],"recommendations":["✅ or ❌ prefixed action", "..."]}
Rules: trustScore 100 = completely safe, 0 = definitely malicious. explanation: 3-5 short plain-language bullets a non-technical person understands. recommendations: 3-5 concrete actions prefixed with ❌ (avoid) or ✅ (do).`;

type AiPayload = {
  trustScore?: number;
  confidence?: number;
  indicators?: string[];
  explanation?: string[];
  recommendations?: string[];
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function buildResult(content: string, type: ScanType, ai: AiPayload | null): ScanResult {
  const heur = runHeuristics(content, type);
  const aiScore = typeof ai?.trustScore === "number" ? clamp(ai.trustScore) : null;
  const score = aiScore === null ? heur.score : clamp(aiScore * 0.65 + heur.score * 0.35);
  const risk = riskFromScore(score);
  const indicators = Array.from(
    new Set([...(ai?.indicators ?? []).filter((i) => typeof i === "string"), ...heur.indicators]),
  ).slice(0, 5);

  return {
    id: crypto.randomUUID(),
    content: content.slice(0, 1200),
    type,
    createdAt: new Date().toISOString(),
    trustScore: score,
    riskLevel: risk.level,
    status: risk.status,
    confidence: clamp(ai?.confidence ?? (aiScore === null ? 82 : 94), 55, 99),
    explanation: (ai?.explanation?.length ? ai.explanation : heur.reasons).slice(0, 6),
    indicators: indicators.length ? indicators : ["Safe"],
    recommendations: (ai?.recommendations?.length
      ? ai.recommendations
      : defaultRecommendations(risk.level, type)
    ).slice(0, 5),
    aiPowered: ai !== null,
  };
}

export async function analyze(content: string): Promise<ScanResult> {
  const type = detectType(content);
  let ai: AiPayload | null = null;
  try {
    const raw = await callAI([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Detected input type: ${labelForType(type)}\n\nAnalyse this content for scams/phishing:\n"""${content.slice(0, 6000)}"""`,
      },
    ]);
    ai = parseJsonBlock<AiPayload>(raw);
  } catch (error) {
    console.error("AI analysis fallback:", error);
  }
  return buildResult(content, type, ai);
}

export async function readImage(imageDataUrl: string): Promise<ScanResult> {
  let extracted = "";
  try {
    extracted = await callAI([
      {
        role: "system",
        content:
          "You read screenshots and photos. Return the full visible text, plus any QR code payload you can decode, as plain text. No commentary.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all text and any QR/barcode content from this image." },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ]);
  } catch (error) {
    console.error("Image OCR failed:", error);
  }

  const content = extracted.trim();
  if (!content) {
    const fallback = buildResult("Image could not be read", "image", null);
    return {
      ...fallback,
      explanation: ["We could not read any text or QR code from this image. Try a clearer screenshot."],
    };
  }

  const inner = await analyze(content);
  return { ...inner, type: "image", content: content.slice(0, 1200) };
}

export async function chat(messages: { role: "user" | "assistant"; content: string }[]) {
  const reply = await callAI([
    {
      role: "system",
      content:
        "You are Scanovix AI Assistant, a friendly cybersecurity expert. Answer in short, simple, non-technical language with practical steps. Use short bullet lists when helpful. Keep answers under 160 words.",
    },
    ...messages,
  ]);
  return { reply: reply || "I couldn't generate an answer, please try again." };
}
