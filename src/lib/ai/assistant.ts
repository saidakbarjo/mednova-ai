import { normalizeForMatch, toOldUzbek, type Locale } from "@/i18n/config";
import { DISCLAIMER, DOSAGE_RESPONSE, detectEmergency, isDosageRequest, type Lang } from "./safety";
import { KNOWLEDGE, SPECIALIST_FOR_SYMPTOM } from "./knowledge";

export type AiSource = "demo" | "llm" | "safety";
export interface AiReply { content: string; source: AiSource; is_emergency: boolean; mode: "demo" | "live" }

export function aiMode(): "demo" | "live" {
  return process.env.ANTHROPIC_API_KEY ? "live" : "demo";
}

/** Reply language: Cyrillic input → Russian; otherwise the interface language. */
export function replyLang(message: string, locale: Locale): Lang {
  if (/[а-яё]/i.test(message)) return "ru";
  if (locale === "ru") return "ru";
  if (locale === "en") return "en";
  return "uz";
}
const out = (text: string, locale: Locale, lang: Lang) => (lang === "uz" && locale === "uz-old" ? toOldUzbek(text) : text);

const SPEC_NAMES: Record<string, Record<Lang, string>> = {
  cardiology: { uz: "Kardiologiya", ru: "Кардиология", en: "Cardiology" },
  neurology: { uz: "Nevrologiya", ru: "Неврология", en: "Neurology" },
  dermatology: { uz: "Dermatologiya", ru: "Дерматология", en: "Dermatology" },
  orthopedics: { uz: "Ortopediya", ru: "Ортопедия", en: "Orthopedics" },
  pediatrics: { uz: "Pediatriya", ru: "Педиатрия", en: "Pediatrics" },
  endocrinology: { uz: "Endokrinologiya", ru: "Эндокринология", en: "Endocrinology" },
  ophthalmology: { uz: "Oftalmologiya", ru: "Офтальмология", en: "Ophthalmology" },
  "general-practice": { uz: "Umumiy amaliyot", ru: "Общая практика", en: "General Practice" },
  psychiatry: { uz: "Psixiatriya", ru: "Психиатрия", en: "Psychiatry" },
};

const UI: Record<Lang, { relevant: string; browse: string; fallback: string }> = {
  uz: {
    relevant: "Tegişli mutaxassislik", browse: "MEDNOVA’da tasdiqlangan şifokorlarni topişingiz mumkin.",
    fallback: "Men **demo rejimda** işlayapman, şuning uçun tanlangan ta’limiy mavzular asosida javob beraman. Bu savolga mos mavzu topa olmadim.\n\n**Mana bularni sörab köring:**\n- Mutaxassis nima qiladi — *«Nevrolog nima bilan şuğullanadi?»*\n- Tibbiy atamalar — *«HbA1c nima?»*, *«Qon bosimi raqamlarini tuşuntiring»*\n- Kundalik salomatlik — isitma, boş oğriği, uyqu, şamollaş va gripp\n- *«Şifokorga savollar tayyorlaşga yordam bering»*\n\nSoğliğingizga oid aniq savollar uçun malakali şifokorga murojaat qiling.",
  },
  ru: {
    relevant: "Профильная специальность", browse: "Проверенных врачей можно найти на MEDNOVA.",
    fallback: "Я работаю в **демо-режиме** и отвечаю по набору образовательных тем. Подходящую тему найти не удалось.\n\n**Попробуйте спросить:**\n- Чем занимается специалист — *«Что делает невролог?»*\n- Медицинские термины — *«Что такое HbA1c?»*, *«Объясните цифры давления»*\n- Повседневное здоровье — температура, головная боль, сон, простуда и грипп\n- *«Помогите подготовить вопросы врачу»*\n\nПо вопросам о вашем здоровье обращайтесь к врачу.",
  },
  en: {
    relevant: "Relevant specialist", browse: "You can browse verified doctors on MEDNOVA.",
    fallback: "I'm running in **demo mode**, so I answer from a curated set of educational topics. I couldn't find a close match for that question.\n\n**Try asking about:**\n- What a specialist does — *\"What does a neurologist do?\"*\n- Medical terms — *\"What is HbA1c?\"*, *\"Explain blood pressure numbers\"*\n- Everyday health — fever, headaches, sleep, colds vs flu\n- *\"Help me prepare questions for my doctor\"*\n\nFor anything specific to your health, a qualified clinician is the right person to ask.",
  },
};

function matchTopics(text: string) {
  const n = normalizeForMatch(text);
  return KNOWLEDGE.map((k) => ({ k, score: k.keywords.reduce((s, kw) => s + (n.includes(normalizeForMatch(kw)) ? kw.length : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

function demoAnswer(message: string, lang: Lang): string {
  const top = matchTopics(message).slice(0, 2);
  if (!top.length) return UI[lang].fallback;
  let text = top.map((x) => x.k.answer[lang]).join("\n\n");
  const spec = top.find((x) => x.k.specialist)?.k.specialist;
  if (spec) text += `\n\n**${UI[lang].relevant}:** ${SPEC_NAMES[spec][lang]} — ${UI[lang].browse}`;
  return text;
}

const SYSTEM_PROMPT = (lang: Lang) => `You are MEDNOVA AI, an educational health-information assistant inside a healthcare platform used in Uzbekistan.
Rules you must always follow:
- You are NOT a doctor and never claim to be one. Never diagnose a disease; describe possibilities only in general, educational terms and say clearly when you are uncertain.
- Never prescribe medication, never recommend specific drugs for the user, and never give doses.
- If the user describes possible emergency warning signs, tell them to call emergency services immediately (Uzbekistan 103, EU 112) before anything else.
- Encourage consulting a qualified clinician when appropriate, and suggest which type of specialist usually handles the topic.
- Be concise (under 220 words), warm and clear. Use short paragraphs or bullet points and **bold** for key terms.
- Reply in ${lang === "uz" ? "Uzbek, written in the NEW Uzbek Latin alphabet (use ö, ğ, ş, ç instead of o‘, g‘, sh, ch)" : lang === "ru" ? "Russian" : "English"}.`;

async function llmAnswer(history: { role: "user" | "assistant"; content: string }[], message: string, lang: Lang): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY as string, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 800,
      system: SYSTEM_PROMPT(lang),
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

export async function generateReply(history: { role: "user" | "assistant"; content: string }[], message: string, locale: Locale): Promise<AiReply> {
  const mode = aiMode();
  const lang = replyLang(message, locale);
  const emergency = detectEmergency(message, lang);
  if (emergency.emergency) return { content: out(emergency.response!, locale, lang), source: "safety", is_emergency: true, mode };
  if (isDosageRequest(message)) return { content: out(`${DOSAGE_RESPONSE[lang]}\n\n_${DISCLAIMER[lang]}_`, locale, lang), source: "safety", is_emergency: false, mode };

  if (mode === "live") {
    try {
      const text = await llmAnswer(history, message, lang);
      return { content: out(`${text}\n\n_${DISCLAIMER[lang]}_`, locale, lang), source: "llm", is_emergency: false, mode };
    } catch (e) {
      console.error("[ai] provider failed, falling back to demo mode", e);
    }
  }
  return { content: out(`${demoAnswer(message, lang)}\n\n_${DISCLAIMER[lang]}_`, locale, lang), source: "demo", is_emergency: false, mode };
}

const SYMPTOM_TEXT: Record<Lang, { questions: (first: string) => string[]; notDx: string }> = {
  uz: {
    questions: (s) => [`«${s}» qaçon boşlandi va vaqt ötişi bilan özgardimi?`, "Bu belgilarga nima sabab bölişi mumkin va buni qanday aniqlaymiz?", "Qanday tahlil yoki tekşiruvlar kerak?", "Qaysi xavfli belgilar paydo bölsa, tezroq murojaat qilişim kerak?", "Hozirça uyda nima qilişim mumkin?"],
    notDx: "Bu taşxis emas.",
  },
  ru: {
    questions: (s) => [`Когда начался симптом «${s}» и менялся ли он со временем?`, "Что может вызывать эти симптомы и как это выяснить?", "Какие анализы или обследования нужны?", "При каких тревожных признаках обращаться срочно?", "Что можно делать дома пока?"],
    notDx: "Это не диагноз.",
  },
  en: {
    questions: (s) => [`When did the ${s} start, and has it changed over time?`, "What could be causing these symptoms, and how will we find out?", "Which tests, if any, do I need?", "What warning signs mean I should seek care sooner?", "Is there anything I can do at home in the meantime?"],
    notDx: "This is not a diagnosis.",
  },
};

/** Structured, rules-based symptom information (always deterministic). */
export function symptomInformation(symptoms: string[], locale: Locale, duration?: string, ageGroup?: string) {
  const lang = replyLang(symptoms.join(" "), locale);
  const joined = symptoms.join(", ");
  const emergency = detectEmergency(joined, lang);
  const specialists = new Set<string>();
  for (const s of symptoms) for (const [re, spec] of SPECIALIST_FOR_SYMPTOM) if (re.test(normalizeForMatch(s))) specialists.add(spec);
  if (ageGroup === "child") specialists.add("pediatrics");
  if (!specialists.size) specialists.add("general-practice");

  const topics = matchTopics(joined).slice(0, 3).map((x) => ({ topic: x.k.id, information: out(x.k.answer[lang], locale, lang) }));
  const urgency = emergency.emergency ? "emergency"
    : duration === "weeks" || duration === "months" ? "book_appointment"
    : ageGroup === "child" || ageGroup === "older_adult" ? "consider_prompt_review" : "monitor_and_consult_if_persisting";

  return {
    emergency: emergency.emergency,
    emergency_message: emergency.response ? out(emergency.response, locale, lang) : null,
    urgency,
    suggested_specialists: Array.from(specialists),
    general_information: topics,
    questions_for_your_doctor: SYMPTOM_TEXT[lang].questions(symptoms[0]).map((q) => out(q, locale, lang)),
    disclaimer: out(`${DISCLAIMER[lang]} ${SYMPTOM_TEXT[lang].notDx}`, locale, lang),
  };
}
