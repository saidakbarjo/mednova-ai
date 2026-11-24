/**
 * Safety layer — runs BEFORE any AI response (demo or LLM), in every language.
 * Deterministic rules so critical behaviour never depends on a model.
 * Input is normalised (any Uzbek alphabet → ASCII-ish form) before matching.
 */
import { normalizeForMatch } from "@/i18n/config";

export type Lang = "uz" | "ru" | "en";

export const DISCLAIMER: Record<Lang, string> = {
  uz: "MEDNOVA AI faqat umumiy tibbiy ma’lumot beradi. U taşxis qöymaydi, dori buyurmaydi va litsenziyali şifokor örnini bosmaydi.",
  ru: "MEDNOVA AI даёт только общую медицинскую информацию. Он не ставит диагноз, не назначает лекарства и не заменяет врача.",
  en: "MEDNOVA AI provides general health education only. It does not diagnose, prescribe, or replace a licensed clinician.",
};

type Rule = { id: string; patterns: RegExp[] };
const RULES: Rule[] = [
  { id: "self_harm", patterns: [
    /\b(kill(ing)? myself|suicid\w*|end (my|it) (life|all)|want to die|self[- ]?harm|hurt myself)/,
    /o'zimni o'ldir|o'z joni(ga|mga) qasd|yashagim kelmay|o'lgim kel|o'zimga zarar/,
    /покончить с собой|суицид|убить себя|не хочу жить|хочу умереть|причинить себе вред/,
  ] },
  { id: "cardiac", patterns: [
    /chest (pain|pressure|tightness).{0,60}(arm|jaw|neck|back|sweat|breath|faint|nause)/, /(arm|jaw).{0,40}chest (pain|pressure)/,
    /\b(having|think i'?m having|signs of) a heart attack\b/, /crushing chest/,
    /ko'kra[kg].{0,25}(og'ri|siqil|bosil).{0,60}(qo'l|jag'|bo'yin|kurak|ter|nafas|ko'ngil)/, /(qo'l|jag').{0,40}ko'kra[kg].{0,15}og'ri/, /infarkt/,
    /бол\w* в груди.{0,60}(рук|челюст|ше[ия]|спин|пот|дыш|тошн)/, /(рук|челюст).{0,40}бол\w* в груди/, /инфаркт/, /давящ\w* бол/,
  ] },
  { id: "stroke", patterns: [
    /\b(having|think i'?m having|is having) a stroke\b/, /face (droop|drooping|is drooping)/, /slurred speech/, /(sudden|suddenly).{0,30}(numb|weak|can'?t (move|speak|see)|confus)/,
    /insult/, /yuz(im|i)?.{0,15}(qiyshay|osil)/, /nutqi?.{0,15}(buzil|chalkash)/, /to'satdan.{0,30}(uvish|holsiz|gapira olma|ko'rmay)/,
    /инсульт/, /перекос\w* лиц/, /невнятн\w* речь/, /внезапн\w*.{0,30}(онемен|слабост|не могу говорить)/,
  ] },
  { id: "breathing", patterns: [
    /can'?t breathe|cannot breathe|struggling to breathe|choking|turning blue|lips (are )?blue/, /throat (is )?(swelling|closing)/, /anaphyla/,
    /nafas ol(a ?olma|ish qiyin)|bo'g'il|lablar(im)? ko'kar|tomog'?im shish/, /anafilak/,
    /не могу дышать|задыха|губы посинел|отек горла|анафилак/,
  ] },
  { id: "other_critical", patterns: [
    /unconscious|unresponsive|having a seizure|seizure (that )?(won'?t stop|lasting)/, /(heavy|severe|uncontrolled) bleeding|won'?t stop bleeding/,
    /overdos|poison(ed|ing)|swallowed (bleach|chemicals|pills)/, /worst headache of my life|thunderclap headache/, /stiff neck.{0,40}fever|fever.{0,40}stiff neck/,
    /hushini yo'qot|hushsiz|tutqanoq|qon to'xtamay|kuchli qon ket|zaharlan|dozani oshirib/, /hayotimdagi eng kuchli bosh og'ri/,
    /без сознания|потерял\w* сознание|судорог|сильное кровотечен|кровь не останавлива|отравлен|передозир/, /самая сильная головная боль/,
  ] },
];

const EMERGENCY_TEXT: Record<Lang, { head: string; reasons: Record<string, string>; steps: string; crisis: string }> = {
  uz: {
    head: "🚨 **Iltimos, darhol tez yordam çaqiring.**",
    reasons: {
      cardiac: "Qöl, jağ, böyin yoki orqaga tarqaladigan, ter, köngil aynişi yoki nafas qisişi bilan kelgan kökrak oğriği **infarkt** belgisi bölişi mumkin.",
      stroke: "Yuzning qiyşayişi, qölda holsizlik, nutqning buzilişi yoki tösatdan çalkaşlik **insult** belgilari bölişi mumkin — har daqiqa muhim.",
      breathing: "Kuçli nafas qisişi, tomoq şişişi yoki lablarning kökarişi **hayot uçun xavfli** bölişi mumkin.",
      other_critical: "Siz ta’riflagan holat **şoşilinç tibbiy holat** bölişi mumkin.",
    },
    steps: "- **Darhol 103 raqamiga qönğiroq qiling** (Özbekiston; Yevropada — **112**).\n- Özingiz maşina haydamang; imkon bölsa, yoningizda kimdir bölsin.\n- Agar odam huşsiz va normal nafas olmayotgan bölsa, dispetçer sizga yurak-öpka reanimatsiyasini körsatib beradi.\n\nMen ta’limiy yordamçiman va şoşilinç holatlarni baholay olmayman — buni malakali mutaxassislar qiladi.",
    crisis: "Yozganingiz uçun raxmat. Siz his qilayotgan narsa muhim va hozir sizga haqiqiy inson yordam berişi kerak.\n\n**Agar hozir xavf ostida bölsangiz, darhol 103 yoki 112 ga qönğiroq qiling.**\n\nIşonçli odamga — döstingiz, oila a’zongiz yoki şifokorga — nimalarni boşdan keçirayotganingizni ayting. Siz bu bilan yolğiz emassiz.",
  },
  ru: {
    head: "🚨 **Пожалуйста, немедленно вызовите скорую помощь.**",
    reasons: {
      cardiac: "Боль или давление в груди, отдающие в руку, челюсть, шею или спину, а также с потом, тошнотой или одышкой, могут быть признаком **инфаркта**.",
      stroke: "Внезапная асимметрия лица, слабость в руке, нарушение речи или спутанность сознания могут быть признаками **инсульта** — важна каждая минута.",
      breathing: "Сильное затруднение дыхания, отёк горла или посинение губ могут быть **опасны для жизни**.",
      other_critical: "То, что вы описываете, может быть **неотложным состоянием**.",
    },
    steps: "- **Сразу звоните 103** (Узбекистан; в Европе — **112**).\n- Не садитесь за руль сами; по возможности будьте рядом с кем-то.\n- Если человек без сознания и не дышит нормально, диспетчер подскажет, как делать СЛР.\n\nЯ образовательный помощник и не могу оценивать экстренные ситуации — это делают специалисты.",
    crisis: "Спасибо, что написали. Ваши чувства важны, и сейчас вам нужна поддержка живого человека.\n\n**Если вы в опасности прямо сейчас, звоните 103 или 112.**\n\nРасскажите о том, что происходит, тому, кому доверяете — другу, близкому или врачу. Вы не одни.",
  },
  en: {
    head: "🚨 **Please seek emergency help now.**",
    reasons: {
      cardiac: "Chest pain or pressure that spreads to the arm, jaw, neck or back, or comes with sweating, nausea or breathlessness, can be a sign of a **heart attack**.",
      stroke: "Sudden face drooping, arm weakness, slurred speech or confusion can be signs of a **stroke** — every minute matters (remember **F.A.S.T.**).",
      breathing: "Severe difficulty breathing, throat swelling or blue lips can be **life-threatening**.",
      other_critical: "What you describe may be a **medical emergency**.",
    },
    steps: "- **Call your local emergency number immediately** (Uzbekistan: **103**, EU incl. Italy: **112**).\n- Do not drive yourself; stay with someone if possible.\n- If the person is unresponsive and not breathing normally, the dispatcher can guide you through CPR.\n\nI'm an educational assistant and can't assess emergencies — trained responders can.",
    crisis: "I'm really glad you reached out. What you're feeling matters, and you deserve support right now from a real person.\n\n**If you are in immediate danger, call your local emergency number now** (Uzbekistan: **103** / **112**, EU: **112**).\n\nYou can also tell someone you trust — a friend, family member, or doctor — what you're going through. You don't have to handle this alone.",
  },
};

export function detectEmergency(text: string, lang: Lang): { emergency: boolean; id?: string; response?: string } {
  const n = normalizeForMatch(text);
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(n))) {
      const T = EMERGENCY_TEXT[lang];
      const response = rule.id === "self_harm" ? T.crisis : `${T.head}\n\n${T.reasons[rule.id]}\n\n${T.steps}`;
      return { emergency: true, id: rule.id, response };
    }
  }
  return { emergency: false };
}

const DOSAGE = [
  /\b(how (much|many)|what) (mg|milligrams?|pills?|tablets?|dose|dosage)\b/, /\b(dose|dosage|dosing)\b/, /\bhow (much|many) .{0,30}(should|can) i take\b/,
  /\bprescribe\b|\bprescription for\b/, /\bwhich (antibiotic|medicine|medication|drug) should i\b/,
  /\bdoza|necha (mg|milligramm|tabletka|dona)|qancha (ichsam|ichish|qabul qil)|qaysi dori(ni)? ich|dori yozib ber|retsept yoz/,
  /дозировк|какую дозу|сколько (мг|таблет|капель)|сколько (мне )?(пить|принимать)|какое лекарство (мне )?(пить|принимать)|выпишите|назначьте/,
];
export function isDosageRequest(text: string) {
  const n = normalizeForMatch(text);
  return DOSAGE.some((p) => p.test(n));
}

export const DOSAGE_RESPONSE: Record<Lang, string> = {
  uz: "Men dori, doza yoki retsept tavsiya qila olmayman — töğri tanlov yoşingiz, vazningiz, boşqa kasalliklar va qabul qilayotgan dorilaringizga boğliq, buni faqat şifokor yoki farmatsevt xavfsiz baholay oladi.\n\n**Nimada yordam bera olaman:**\n- Dori turining umumiy vazifasini tuşuntirib berişda\n- Şifokor yoki farmatsevtga savollar tayyorlaşda, masalan: *«Bu dori boşqa dorilarim bilan xavfsizmi?»*, *«Qanday nojöya ta’sirlarga e’tibor beray?»*\n- Yoriqnoma yoki retseptga aniq amal qilişni eslatişda\n\nAgar dorini haddan ortiq içgan deb öylasangiz, darhol **103** ga qönğiroq qiling.",
  ru: "Я не могу рекомендовать лекарства, дозировки или назначения — правильный выбор зависит от возраста, веса, других заболеваний и принимаемых препаратов, и безопасно оценить это может только врач или фармацевт.\n\n**Чем я могу помочь:**\n- Объяснить, как в целом действует тип лекарства\n- Подготовить вопросы врачу или фармацевту, например: *«Совместимо ли это с моими лекарствами?»*, *«На какие побочные эффекты обратить внимание?»*\n- Напомнить точно следовать инструкции или рецепту\n\nЕсли вы думаете, что приняли слишком много лекарства, сразу звоните **103**.",
  en: "I can't recommend medications, doses or prescriptions — the right choice depends on your age, weight, other conditions and medicines, which only a clinician or pharmacist can assess safely.\n\n**What I can help with:**\n- Explaining what a type of medicine generally does\n- Preparing questions for your doctor or pharmacist, e.g. *\"Is this safe with my other medicines?\"*, *\"What side effects should I watch for?\"*\n- Reminding you to always follow the label or your prescription exactly\n\nIf you think you've taken too much of a medicine, contact emergency services (103 / 112) right away.",
};
