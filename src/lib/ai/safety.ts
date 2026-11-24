/**
 * Safety layer — runs BEFORE any AI response (demo or LLM).
 * Deterministic rules so critical behaviour never depends on a model.
 */

export const DISCLAIMER =
  "MEDNOVA AI provides general health education only. It does not diagnose, prescribe, or replace a licensed clinician.";

type Rule = { id: string; patterns: RegExp[]; message: string };

const EMERGENCY_RULES: Rule[] = [
  {
    id: "self_harm",
    patterns: [/\b(kill(ing)? myself|suicid\w*|end (my|it) (life|all)|want to die|self[- ]?harm|hurt myself|o'?zimni o'ldir|покончить с собой|суицид)/i],
    message:
      "I'm really glad you reached out. What you're feeling matters, and you deserve support right now from a real person.\n\n" +
      "**If you are in immediate danger, call your local emergency number now** (Uzbekistan: **103** / **112**, EU incl. Italy: **112**).\n\n" +
      "You can also contact a local crisis line or tell someone you trust — a friend, family member, or doctor — what you're going through. You don't have to handle this alone.",
  },
  {
    id: "cardiac",
    patterns: [
      /chest (pain|pressure|tightness).{0,60}(arm|jaw|neck|back|sweat|breath|faint|nause)/i,
      /(arm|jaw).{0,40}chest (pain|pressure)/i,
      /\b(having|think i'?m having|signs of) a heart attack\b/i,
      /crushing chest/i,
    ],
    message: "Chest pain or pressure that spreads to the arm, jaw, neck or back, or comes with sweating, nausea or breathlessness, can be a sign of a **heart attack**.",
  },
  {
    id: "stroke",
    patterns: [/\b(having|think i'?m having|is having) a stroke\b/i, /face (droop|drooping|is drooping)/i, /slurred speech/i, /(sudden|suddenly).{0,30}(numb|weak|can'?t (move|speak|see)|confus)/i, /one side of (my|the|his|her) (body|face)/i],
    message: "Sudden face drooping, arm weakness, slurred speech or confusion can be signs of a **stroke** — every minute matters (remember **F.A.S.T.**).",
  },
  {
    id: "breathing",
    patterns: [/can'?t breathe|cannot breathe|struggling to breathe|choking|turning blue|lips (are )?blue/i, /throat (is )?(swelling|closing)/i, /anaphyla/i],
    message: "Severe difficulty breathing, throat swelling or blue lips can be **life-threatening**.",
  },
  {
    id: "other_critical",
    patterns: [
      /unconscious|passed out and (won'?t|not) wak|unresponsive/i,
      /seizure (that )?(won'?t stop|lasting)|having a seizure/i,
      /(heavy|severe|uncontrolled) bleeding|won'?t stop bleeding/i,
      /overdos|poison(ed|ing)|swallowed (bleach|chemicals|pills)/i,
      /worst headache of my life|thunderclap headache/i,
      /stiff neck.{0,40}fever|fever.{0,40}stiff neck/i,
    ],
    message: "What you describe may be a **medical emergency**.",
  },
];

export function detectEmergency(text: string): { emergency: boolean; id?: string; response?: string } {
  for (const rule of EMERGENCY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      const response =
        rule.id === "self_harm"
          ? rule.message
          : `🚨 **Please seek emergency help now.**\n\n${rule.message}\n\n` +
            "- **Call your local emergency number immediately** (Uzbekistan: **103**, EU incl. Italy: **112**).\n" +
            "- Do not drive yourself; stay with someone if possible.\n" +
            "- If the person is unresponsive and not breathing normally, the dispatcher can guide you through CPR.\n\n" +
            "I'm an educational assistant and can't assess emergencies — trained responders can.";
      return { emergency: true, id: rule.id, response };
    }
  }
  return { emergency: false };
}

const DOSAGE_PATTERNS = [
  /\b(how (much|many)|what) (mg|milligrams?|pills?|tablets?|dose|dosage)\b/i,
  /\b(dose|dosage|dosing)\b/i,
  /\bhow (much|many) .{0,30}(should|can) i take\b/i,
  /\bprescribe\b|\bprescription for\b/i,
  /\bwhich (antibiotic|medicine|medication|drug) should i\b/i,
];

export function isDosageRequest(text: string) {
  return DOSAGE_PATTERNS.some((p) => p.test(text));
}

export const DOSAGE_RESPONSE =
  "I can't recommend medications, doses or prescriptions — the right choice depends on your age, weight, other conditions and medicines, which only a clinician or pharmacist can assess safely.\n\n" +
  "**What I can help with:**\n" +
  "- Explaining what a type of medicine generally does\n" +
  "- Preparing questions for your doctor or pharmacist, e.g. *\"Is this safe with my other medicines?\"*, *\"What side effects should I watch for?\"*\n" +
  "- Reminding you to always follow the label or your prescription exactly\n\n" +
  "If you think you've taken too much of a medicine, contact emergency services or a poison-control service right away.";
