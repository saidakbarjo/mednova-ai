/**
 * DEMO MODE knowledge base — curated, general educational answers used when
 * no AI API key is configured. Each entry is matched by keywords.
 */
export type KnowledgeEntry = {
  id: string;
  keywords: string[];
  answer: string;
  specialist?: string;
};

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "cardiologist", keywords: ["cardiologist", "cardiology", "heart doctor"], specialist: "Cardiology",
    answer: "A **cardiologist** specialises in the heart and blood vessels. They evaluate symptoms such as chest discomfort, palpitations or breathlessness on exertion, manage conditions like high blood pressure or high cholesterol, and use tests such as an **ECG**, **echocardiogram** or **stress test**.",
  },
  {
    id: "neurologist", keywords: ["neurologist", "neurology", "nerve doctor"], specialist: "Neurology",
    answer: "A **neurologist** diagnoses and treats conditions of the brain, spinal cord and nerves — for example recurring headaches or migraine, seizures, numbness or tingling, tremor and memory problems. Common tests include an **MRI**, **EEG** and nerve-conduction studies.",
  },
  {
    id: "dermatologist", keywords: ["dermatologist", "dermatology", "skin doctor", "mole", "rash", "acne", "eczema"], specialist: "Dermatology",
    answer: "A **dermatologist** looks after skin, hair and nails: rashes, acne, eczema, hair loss and checking moles. A useful rule for moles is **ABCDE** — *Asymmetry, Border irregularity, Colour variation, Diameter > 6 mm, Evolving*. Any mole that changes, bleeds or itches is worth showing to a dermatologist.",
  },
  {
    id: "orthopedist", keywords: ["orthopedic", "orthopaedic", "orthopedist", "joint pain", "knee", "back pain", "sprain"], specialist: "Orthopedics",
    answer: "An **orthopaedic specialist** treats bones, joints, ligaments and muscles — sports injuries, back and neck pain, arthritis and fractures. Many joint problems improve with rest, gradual strengthening and physiotherapy, but swelling, inability to bear weight, deformity or numbness should be assessed promptly.",
  },
  {
    id: "endocrinologist", keywords: ["endocrinologist", "endocrinology", "hormone", "thyroid"], specialist: "Endocrinology",
    answer: "An **endocrinologist** treats hormone and metabolic conditions — diabetes, thyroid disorders, and problems of the adrenal or pituitary glands. Blood tests (for example **TSH** for the thyroid or **HbA1c** for blood sugar) are central to their work.",
  },
  {
    id: "pediatrician", keywords: ["pediatrician", "paediatrician", "pediatrics", "child doctor", "my child", "my baby", "toddler"], specialist: "Pediatrics",
    answer: "A **paediatrician** cares for children from birth through adolescence: growth and development checks, vaccinations and childhood illnesses. Children can become unwell faster than adults — for an infant under 3 months with a fever, or any child who is unusually drowsy, struggling to breathe or not drinking, seek medical care promptly.",
  },
  {
    id: "psychiatrist", keywords: ["psychiatrist", "psychiatry", "anxiety", "stress", "depress", "mental health", "panic"], specialist: "Psychiatry",
    answer: "Mental health is part of health. **Psychiatrists** are doctors who assess and treat conditions such as anxiety, depression and sleep problems; **psychologists** and therapists provide talking therapies. Helpful everyday foundations include regular sleep, movement, daylight, staying connected with people you trust, and limiting alcohol. If low mood or worry lasts more than two weeks or affects daily life, it is worth talking to a professional.",
  },
  {
    id: "hypertension", keywords: ["hypertension", "blood pressure", "high bp", "bp reading", "systolic", "diastolic"], specialist: "Cardiology",
    answer: "**Blood pressure** is written as two numbers, e.g. **120/80 mmHg**:\n- **Systolic** (top) — pressure when the heart beats\n- **Diastolic** (bottom) — pressure between beats\n\nReadings consistently **at or above about 130/80–140/90** (depending on the guideline) are generally considered high (**hypertension**). It often has no symptoms, which is why regular measurement matters. Lifestyle factors that help include less salt, regular activity, a healthy weight, limited alcohol and not smoking. A clinician decides whether treatment is needed.",
  },
  {
    id: "cholesterol", keywords: ["cholesterol", "ldl", "hdl", "triglyceride", "lipid"], specialist: "Cardiology",
    answer: "A **lipid panel** measures fats in the blood:\n- **LDL** — often called \"bad\" cholesterol; high levels contribute to plaque in arteries\n- **HDL** — \"good\" cholesterol; helps remove excess cholesterol\n- **Triglycerides** — a type of fat linked to diet, alcohol and blood sugar\n\nTarget values depend on your overall cardiovascular risk, so your doctor interprets them together with age, blood pressure, smoking and family history.",
  },
  {
    id: "diabetes", keywords: ["diabetes", "blood sugar", "glucose", "hba1c", "a1c", "insulin"], specialist: "Endocrinology",
    answer: "**Diabetes** means blood glucose (sugar) is higher than normal because the body doesn't make enough insulin or doesn't use it well.\n- **HbA1c** reflects average blood sugar over ~3 months (often < 5.7% is considered normal and ≥ 6.5% is in the diabetes range).\n- Common signs of high blood sugar include thirst, frequent urination, tiredness and blurred vision.\n\nDiagnosis and treatment decisions are made by a clinician based on repeated tests.",
  },
  {
    id: "bmi", keywords: ["bmi", "body mass index", "overweight", "weight loss"],
    answer: "**Body Mass Index (BMI)** = weight (kg) ÷ height (m)². For adults, 18.5–24.9 is usually labelled the \"healthy\" range. BMI is a quick screening tool but doesn't distinguish muscle from fat or account for where fat is stored, so waist circumference and overall health are also considered.",
  },
  {
    id: "ecg", keywords: ["ecg", "ekg", "electrocardiogram"], specialist: "Cardiology",
    answer: "An **ECG (electrocardiogram)** records the heart's electrical activity using small stickers on the chest, arms and legs. It's quick and painless, and helps clinicians look at heart rhythm, rate and signs of strain or previous damage.",
  },
  {
    id: "imaging", keywords: ["mri", "ct scan", "x-ray", "xray", "ultrasound", "imaging"],
    answer: "Common imaging tests:\n- **X-ray** — quick images, great for bones and chest\n- **Ultrasound** — sound waves, no radiation; used for organs, pregnancy, blood flow\n- **CT** — detailed cross-sectional X-ray images\n- **MRI** — magnets and radio waves; excellent detail of brain, spine, joints and soft tissue (tell staff about any metal implants)",
  },
  {
    id: "antibiotics", keywords: ["antibiotic", "antibiotics", "virus vs bacteria", "viral"],
    answer: "**Antibiotics** treat bacterial infections; they **don't work against viruses** such as colds and most flu-like illnesses. Using them when they're not needed can cause side effects and contributes to antibiotic resistance. Only a clinician can decide whether an antibiotic is appropriate.",
  },
  {
    id: "vaccines", keywords: ["vaccine", "vaccination", "immunisation", "immunization", "booster"],
    answer: "**Vaccines** train the immune system to recognise a germ without causing the disease, so the body can respond faster if exposed later. Some need **boosters** because protection fades over time. Your doctor or local health authority can tell you which vaccines are recommended for your age and situation.",
  },
  {
    id: "fever", keywords: ["fever", "temperature", "high temperature"],
    answer: "A **fever** (usually ≥ 38 °C / 100.4 °F) is the body's normal response to infection. Rest and fluids help. **Seek medical care** if a fever lasts more than 3 days, is very high, or comes with a stiff neck, rash that doesn't fade under pressure, confusion, difficulty breathing — or for any fever in a baby under 3 months.",
  },
  {
    id: "headache", keywords: ["headache", "migraine", "head pain"], specialist: "Neurology",
    answer: "Most **headaches** are tension-type or **migraine**. Migraine is often one-sided and throbbing, with sensitivity to light or sound and sometimes nausea. Common triggers include poor sleep, stress, dehydration and skipped meals — a headache diary helps. **Urgent care is needed** for a sudden \"worst-ever\" headache, headache with fever and stiff neck, after a head injury, or with weakness, confusion or vision loss.",
  },
  {
    id: "cold_flu", keywords: ["cold", "flu", "influenza", "sore throat", "runny nose", "cough"], specialist: "General Practice",
    answer: "**Colds** usually come on gradually with a runny nose and sore throat; **flu** tends to start suddenly with fever, aches and exhaustion. Both are viral, so rest, fluids and time are the mainstays. See a clinician if you have difficulty breathing, chest pain, symptoms lasting more than ~10 days, or if you're in a higher-risk group.",
  },
  {
    id: "sleep", keywords: ["sleep", "insomnia", "tired", "fatigue"],
    answer: "Most adults need **7–9 hours** of sleep. Helpful habits: a consistent schedule, a dark and cool room, limiting screens and caffeine in the evening, and daytime physical activity. Ongoing tiredness despite enough sleep can have many causes (e.g. anaemia, thyroid issues, sleep apnoea, low mood) and is worth discussing with a doctor.",
  },
  {
    id: "prepare", keywords: ["prepare", "questions for my doctor", "questions to ask", "appointment tips", "what should i ask"],
    answer: "Preparing for an appointment helps you get the most from it:\n1. **Write down your symptoms** — when they started, how often, what makes them better or worse.\n2. **List your medicines and supplements**, including doses.\n3. **Note your history** — allergies, past conditions, family history.\n4. **Prepare 3–5 questions**, e.g.\n   - *What could be causing this?*\n   - *Which tests do I need, and why?*\n   - *What are my options and their pros and cons?*\n   - *What warning signs should make me come back sooner?*\n5. **Bring someone** if you'd like support, and take notes.",
  },
  {
    id: "lab_results", keywords: ["lab result", "blood test", "reference range", "cbc", "blood count", "haemoglobin", "hemoglobin"],
    answer: "Lab reports show your value next to a **reference range** — the range seen in most healthy people. A result slightly outside the range isn't automatically a problem; labs, age and sex can change ranges, and your doctor interprets results alongside your symptoms and history. A **CBC (complete blood count)** looks at red cells (oxygen-carrying), white cells (immune system) and platelets (clotting).",
  },
  {
    id: "hydration", keywords: ["water", "hydration", "dehydrat"],
    answer: "Fluid needs vary with body size, climate and activity; pale-yellow urine is a simple everyday sign of good hydration. Signs of dehydration include thirst, dark urine, dizziness and headache. Older adults, young children and people exercising in heat are more vulnerable.",
  },
  {
    id: "exercise", keywords: ["exercise", "physical activity", "workout", "steps"],
    answer: "General guidance for adults is about **150 minutes of moderate activity** per week (e.g. brisk walking) plus **muscle-strengthening** on 2 days. Start gradually and build up. If you have a heart condition, chest pain on exertion, or haven't been active for a long time, check with a clinician first.",
  },
  {
    id: "eyes", keywords: ["eye", "vision", "eyesight", "screen strain", "ophthalmologist"], specialist: "Ophthalmology",
    answer: "For **digital eye strain**, try the **20-20-20 rule**: every 20 minutes, look at something 20 feet (~6 m) away for 20 seconds. Sudden vision loss, flashes with a \"curtain\" over vision, or a painful red eye need urgent assessment by an **ophthalmologist** or emergency service.",
  },
];

export const SPECIALIST_FOR_SYMPTOM: [RegExp, string][] = [
  [/chest|palpitat|heart|blood pressure|breathless/i, "Cardiology"],
  [/headache|migraine|dizz|numb|tingl|seizure|memory/i, "Neurology"],
  [/rash|itch|skin|mole|acne|hair/i, "Dermatology"],
  [/knee|joint|back|shoulder|ankle|bone|muscle/i, "Orthopedics"],
  [/thirst|urinat|thyroid|weight|sugar/i, "Endocrinology"],
  [/eye|vision|blur/i, "Ophthalmology"],
  [/anx|mood|sleep|stress|panic/i, "Psychiatry"],
];
