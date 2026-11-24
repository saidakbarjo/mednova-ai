import { DISCLAIMER, DOSAGE_RESPONSE, detectEmergency, isDosageRequest } from "./safety";
import { KNOWLEDGE, SPECIALIST_FOR_SYMPTOM } from "./knowledge";

export type AiSource = "demo" | "llm" | "safety";
export interface AiReply {
  content: string;
  source: AiSource;
  is_emergency: boolean;
  mode: "demo" | "live";
}

export function aiMode(): "demo" | "live" {
  return process.env.ANTHROPIC_API_KEY ? "live" : "demo";
}

const SYSTEM_PROMPT = `You are MEDNOVA AI, an educational health-information assistant inside a healthcare platform.
Rules you must always follow:
- You are NOT a doctor and never claim to be one. Never diagnose a disease; describe possibilities only in general, educational terms and say clearly when you are uncertain.
- Never prescribe medication, never recommend specific drugs for the user, and never give doses.
- If the user describes possible emergency warning signs (chest pain spreading to arm/jaw, stroke signs, severe breathing difficulty, heavy bleeding, loss of consciousness, thoughts of self-harm), tell them to contact emergency services immediately (Uzbekistan 103, EU 112) before anything else.
- Encourage consulting a qualified clinician when appropriate, and suggest which type of specialist usually handles the topic.
- You can: explain medical terms, explain what specialists do, give general health education, and help users prepare questions for their doctor.
- Be concise (under 220 words), warm and clear. Use short paragraphs or bullet points and **bold** for key terms. Respond in the user's language.`;

function demoAnswer(message: string): string {
  const text = message.toLowerCase();
  const scored = KNOWLEDGE.map((k) => ({ k, score: k.keywords.reduce((s, kw) => s + (text.includes(kw) ? kw.length : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (!scored.length) {
    return (
      "I'm running in **demo mode**, so I answer from a curated set of educational topics. I couldn't find a close match for that question.\n\n" +
      "**Try asking about:**\n" +
      "- What a specialist does — *\"What does a neurologist do?\"*\n" +
      "- Medical terms — *\"What is HbA1c?\"*, *\"Explain blood pressure numbers\"*\n" +
      "- Everyday health — fever, headaches, sleep, colds vs flu\n" +
      "- *\"Help me prepare questions for my doctor\"*\n\n" +
      "For anything specific to your health, a qualified clinician is the right person to ask."
    );
  }
  const parts = scored.map((x) => x.k.answer);
  const specialist = scored.find((x) => x.k.specialist)?.k.specialist;
  let out = parts.join("\n\n");
  if (specialist) out += `\n\n**Relevant specialist:** ${specialist} — you can browse verified ${specialist.toLowerCase()} doctors on MEDNOVA.`;
  return out;
}

async function llmAnswer(history: { role: "user" | "assistant"; content: string }[], message: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [...history.slice(-10), { role: "user", content: message }],
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`AI provider error ${res.status}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
  if (!text) throw new Error("Empty AI response");
  return text;
}

export async function generateReply(
  history: { role: "user" | "assistant"; content: string }[],
  message: string,
): Promise<AiReply> {
  const mode = aiMode();
  const emergency = detectEmergency(message);
  if (emergency.emergency) return { content: emergency.response!, source: "safety", is_emergency: true, mode };
  if (isDosageRequest(message)) return { content: `${DOSAGE_RESPONSE}\n\n_${DISCLAIMER}_`, source: "safety", is_emergency: false, mode };

  if (mode === "live") {
    try {
      const text = await llmAnswer(history, message);
      return { content: `${text}\n\n_${DISCLAIMER}_`, source: "llm", is_emergency: false, mode };
    } catch (e) {
      console.error("[ai] provider failed, falling back to demo mode", e);
    }
  }
  return { content: `${demoAnswer(message)}\n\n_${DISCLAIMER}_`, source: "demo", is_emergency: false, mode };
}

/** Structured, rules-based symptom information (always deterministic). */
export function symptomInformation(symptoms: string[], duration?: string, ageGroup?: string) {
  const joined = symptoms.join(", ");
  const emergency = detectEmergency(joined);
  const specialists = new Set<string>();
  for (const s of symptoms) for (const [re, spec] of SPECIALIST_FOR_SYMPTOM) if (re.test(s)) specialists.add(spec);
  if (!specialists.size) specialists.add("General Practice");

  const topics = KNOWLEDGE.filter((k) => symptoms.some((s) => k.keywords.some((kw) => s.toLowerCase().includes(kw) || kw.includes(s.toLowerCase()))))
    .slice(0, 3)
    .map((k) => ({ topic: k.id, information: k.answer }));

  const urgency = emergency.emergency
    ? "emergency"
    : duration === "weeks" || duration === "months"
      ? "book_appointment"
      : ageGroup === "child" || ageGroup === "older_adult"
        ? "consider_prompt_review"
        : "monitor_and_consult_if_persisting";

  return {
    emergency: emergency.emergency,
    emergency_message: emergency.response ?? null,
    urgency,
    suggested_specialists: Array.from(specialists),
    general_information: topics,
    questions_for_your_doctor: [
      `When did the ${symptoms[0]} start, and has it changed over time?`,
      "What could be causing these symptoms, and how will we find out?",
      "Which tests, if any, do I need?",
      "What warning signs mean I should seek care sooner?",
      "Is there anything I can do at home in the meantime?",
    ],
    disclaimer: `${DISCLAIMER} This is not a diagnosis.`,
  };
}
