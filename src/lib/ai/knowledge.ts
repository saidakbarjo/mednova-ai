/**
 * DEMO MODE knowledge base — curated, general educational answers in Uzbek (new Latin alphabet),
 * Russian and English. Used when no AI API key is configured. Keywords are matched against
 * normalised input in every language, so a question in any language finds the right topic.
 */
import type { Lang } from "./safety";

export type KnowledgeEntry = { id: string; keywords: string[]; specialist?: string; answer: Record<Lang, string> };

export const KNOWLEDGE: KnowledgeEntry[] = [
  { id: "cardiologist", specialist: "cardiology", keywords: ["cardiologist", "cardiology", "heart doctor", "kardiolog", "yurak shifokor", "кардиолог"],
    answer: {
      uz: "**Kardiolog** — yurak va qon tomirlari böyiça mutaxassis. U kökrakdagi noqulaylik, yurak urişining buzilişi yoki zöriqişda nafas qisilişi kabi belgilarni tekşiradi, yuqori qon bosimi va xolesterinni nazorat qiladi hamda **EKG**, **exokardiografiya** yoki **yuklama testi** kabi tekşiruvlarni buyuradi.",
      ru: "**Кардиолог** — специалист по сердцу и сосудам. Он оценивает дискомфорт в груди, перебои в сердце или одышку при нагрузке, ведёт повышенное давление и холестерин и назначает **ЭКГ**, **ЭхоКГ** или **нагрузочные тесты**.",
      en: "A **cardiologist** specialises in the heart and blood vessels. They evaluate symptoms such as chest discomfort, palpitations or breathlessness on exertion, manage high blood pressure or cholesterol, and use tests such as an **ECG**, **echocardiogram** or **stress test**.",
    } },
  { id: "neurologist", specialist: "neurology", keywords: ["neurologist", "neurology", "nevrolog", "nevropatolog", "невролог", "невропатолог"],
    answer: {
      uz: "**Nevrolog** boş miya, orqa miya va nervlar kasalliklarini davolaydi: takrorlanuvçi boş oğriği va migren, tutqanoqlar, uvişiş, titraş va xotira muammolari. Asosiy tekşiruvlar — **MRT**, **EEG** va nerv ötkazuvçanligi tekşiruvi.",
      ru: "**Невролог** лечит заболевания головного и спинного мозга и нервов: частые головные боли и мигрень, судороги, онемение, тремор, проблемы с памятью. Основные исследования — **МРТ**, **ЭЭГ** и ЭНМГ.",
      en: "A **neurologist** diagnoses and treats conditions of the brain, spinal cord and nerves — recurring headaches or migraine, seizures, numbness or tingling, tremor and memory problems. Common tests include an **MRI**, **EEG** and nerve-conduction studies.",
    } },
  { id: "dermatologist", specialist: "dermatology", keywords: ["dermatologist", "dermatology", "skin", "mole", "rash", "acne", "eczema", "dermatolog", "teri", "toshma", "husnbuzar", "xol", "ekzema", "дерматолог", "кож", "сыпь", "родинк", "акне", "экзем"],
    answer: {
      uz: "**Dermatolog** teri, soç va tirnoqlar bilan şuğullanadi: toşmalar, husnbuzar, ekzema, soç töküliş va xollarni tekşiriş. Xollar uçun foydali qoida — **ABCDE**: *Assimetriya, notekis çegara (Border), rang xilma-xilligi (Colour), diametri > 6 mm, özgariş (Evolving)*. Özgarayotgan, qonayotgan yoki qiçiyotgan xolni dermatologga körsatgan ma’qul.",
      ru: "**Дерматолог** занимается кожей, волосами и ногтями: сыпь, акне, экзема, выпадение волос, осмотр родинок. Полезное правило для родинок — **ABCDE**: *асимметрия, неровный край, разные цвета, диаметр > 6 мм, изменение*. Родинку, которая меняется, кровит или чешется, стоит показать дерматологу.",
      en: "A **dermatologist** looks after skin, hair and nails: rashes, acne, eczema, hair loss and checking moles. A useful rule for moles is **ABCDE** — *Asymmetry, Border irregularity, Colour variation, Diameter > 6 mm, Evolving*. Any mole that changes, bleeds or itches is worth showing to a dermatologist.",
    } },
  { id: "orthopedist", specialist: "orthopedics", keywords: ["orthopedic", "orthopaedic", "joint pain", "knee", "back pain", "sprain", "ortoped", "bo'g'im", "tizza", "bel og'ri", "lat ye", "ортопед", "сустав", "колен", "боль в спине", "растяжен"],
    answer: {
      uz: "**Ortoped** suyaklar, böğimlar, boylamlar va muşaklarni davolaydi — sport jarohatlari, bel va böyin oğriği, artrit, sinişlar. Köp böğim muammolari dam oliş, asta-sekin kuçaytiriş va fizioterapiya bilan yaxşilanadi, lekin şiş, oyoqqa tayana olmaslik, şakl özgarişi yoki uvişiş tezroq körikni talab qiladi.",
      ru: "**Ортопед** лечит кости, суставы, связки и мышцы — спортивные травмы, боли в спине и шее, артрит, переломы. Многие проблемы суставов проходят с отдыхом, постепенным укреплением и ЛФК, но отёк, невозможность опереться на ногу, деформация или онемение требуют скорого осмотра.",
      en: "An **orthopaedic specialist** treats bones, joints, ligaments and muscles — sports injuries, back and neck pain, arthritis and fractures. Many joint problems improve with rest, gradual strengthening and physiotherapy, but swelling, inability to bear weight, deformity or numbness should be assessed promptly.",
    } },
  { id: "endocrinologist", specialist: "endocrinology", keywords: ["endocrinologist", "hormone", "thyroid", "endokrinolog", "gormon", "qalqonsimon", "эндокринолог", "гормон", "щитовид"],
    answer: {
      uz: "**Endokrinolog** gormonlar va moddalar almaşinuvi kasalliklarini davolaydi: qandli diabet, qalqonsimon bez kasalliklari, buyrak usti va gipofiz bezlari muammolari. Qon tahlillari (masalan, qalqonsimon bez uçun **TTG** yoki qon qandi uçun **HbA1c**) uning işida asosiy örin tutadi.",
      ru: "**Эндокринолог** лечит гормональные и обменные нарушения: сахарный диабет, болезни щитовидной железы, надпочечников и гипофиза. Анализы крови (например, **ТТГ** для щитовидной железы или **HbA1c** для сахара) — основа его работы.",
      en: "An **endocrinologist** treats hormone and metabolic conditions — diabetes, thyroid disorders, and problems of the adrenal or pituitary glands. Blood tests (for example **TSH** for the thyroid or **HbA1c** for blood sugar) are central to their work.",
    } },
  { id: "pediatrician", specialist: "pediatrics", keywords: ["pediatrician", "paediatrician", "my child", "my baby", "toddler", "pediatr", "bolam", "farzandim", "chaqaloq", "педиатр", "ребен", "малыш"],
    answer: {
      uz: "**Pediatr** bolalarni tuğilganidan ösmirlik yoşigaça kuzatadi: ösiş va rivojlaniş, emlaşlar va bolalik kasalliklari. Bolalar kattalarga qaraganda tezroq oğirlaşişi mumkin — **3 oylikkaça çaqaloqdagi isitma**, ğayrioddiy uyquçanlik, nafas qisilişi yoki suyuqlik içmaslik holatlarida tezda şifokorga murojaat qiling.",
      ru: "**Педиатр** наблюдает детей от рождения до подросткового возраста: рост и развитие, прививки, детские болезни. Дети могут ухудшаться быстрее взрослых — при **температуре у малыша до 3 месяцев**, необычной вялости, затруднённом дыхании или отказе от питья обращайтесь к врачу без промедления.",
      en: "A **paediatrician** cares for children from birth through adolescence: growth and development checks, vaccinations and childhood illnesses. Children can become unwell faster than adults — for an infant under 3 months with a fever, or any child who is unusually drowsy, struggling to breathe or not drinking, seek medical care promptly.",
    } },
  { id: "mental", specialist: "psychiatry", keywords: ["psychiatrist", "anxiety", "stress", "depress", "mental health", "panic", "psixiatr", "psixolog", "xavotir", "ruhiy", "tushkun", "психиатр", "психолог", "тревог", "стресс", "депресс", "паник"],
    answer: {
      uz: "Ruhiy salomatlik — umumiy salomatlikning bir qismi. **Psixiatrlar** xavotir, tuşkunlik va uyqu buzilişlarini taşxislaydi va davolaydi, **psixologlar** esa suhbat terapiyasini ötkazadi. Kundalik asoslar: muntazam uyqu, harakat, kun yoruğligi, işonçli odamlar bilan aloqa va spirtli içimliklarni kamaytiriş. Agar kayfiyat paslığı yoki xavotir **ikki haftadan ortiq** davom etsa yoki kundalik hayotga ta’sir qilsa, mutaxassis bilan gaplaşing.",
      ru: "Психическое здоровье — часть общего здоровья. **Психиатры** диагностируют и лечат тревогу, депрессию и нарушения сна, **психологи** проводят разговорную терапию. Базовые опоры: регулярный сон, движение, дневной свет, общение с близкими и меньше алкоголя. Если сниженное настроение или тревога длятся **дольше двух недель** или мешают жизни — поговорите со специалистом.",
      en: "Mental health is part of health. **Psychiatrists** assess and treat conditions such as anxiety, depression and sleep problems; **psychologists** provide talking therapies. Helpful foundations include regular sleep, movement, daylight, staying connected with people you trust, and limiting alcohol. If low mood or worry lasts more than **two weeks** or affects daily life, talk to a professional.",
    } },
  { id: "hypertension", specialist: "cardiology", keywords: ["hypertension", "blood pressure", "systolic", "diastolic", "qon bosim", "bosimim", "gipertoni", "sistolik", "diastolik", "давлен", "гипертон", "систолич", "диастолич"],
    answer: {
      uz: "**Qon bosimi** ikki son bilan yoziladi, masalan **120/80 mm sim. ust.**:\n- **Sistolik** (yuqori) — yurak qisqarganda tomirlardagi bosim\n- **Diastolik** (pastki) — qisqarişlar orasidagi bosim\n\nDoimiy ravişda taxminan **130/80–140/90 dan yuqori** körsatkiçlar (tavsiyanomaga qarab) yuqori qon bosimi — **gipertoniya** hisoblanadi. U köpinça heç qanday belgi bermaydi, şuning uçun muntazam ölçaş muhim. Kamroq tuz, muntazam harakat, söğlom vazn va çekmaslik yordam beradi. Davolaş kerakmi — buni şifokor hal qiladi.",
      ru: "**Давление** записывается двумя числами, например **120/80 мм рт. ст.**:\n- **Систолическое** (верхнее) — при сокращении сердца\n- **Диастолическое** (нижнее) — между сокращениями\n\nСтабильные показатели примерно **выше 130/80–140/90** (в зависимости от рекомендаций) считаются повышенными — **гипертония**. Она часто протекает без симптомов, поэтому важно регулярно измерять. Помогают меньше соли, активность, здоровый вес и отказ от курения. Нужно ли лечение — решает врач.",
      en: "**Blood pressure** is written as two numbers, e.g. **120/80 mmHg**:\n- **Systolic** (top) — pressure when the heart beats\n- **Diastolic** (bottom) — pressure between beats\n\nReadings consistently **at or above about 130/80–140/90** (depending on the guideline) are generally considered high (**hypertension**). It often has no symptoms, which is why regular measurement matters. Less salt, regular activity, a healthy weight and not smoking help. A clinician decides whether treatment is needed.",
    } },
  { id: "cholesterol", specialist: "cardiology", keywords: ["cholesterol", "ldl", "hdl", "triglycer", "lipid", "xolesterin", "lipid profil", "холестерин", "липид", "триглицерид"],
    answer: {
      uz: "**Lipid profili** qondagi yoğlarni ölçaydi:\n- **LDL** — «yomon» xolesterin; yuqori bölsa, tomirlarda pilakça hosil böliş xavfini oşiradi\n- **HDL** — «yaxşi» xolesterin; ortiqça xolesterinni olib çiqişga yordam beradi\n- **Triglitseridlar** — ovqatlaniş, spirtli içimlik va qon qandiga boğliq yoğ turi\n\nMaqsadli qiymatlar umumiy yurak-qon tomir xavfingizga boğliq, şuning uçun şifokor ularni yoş, qon bosimi, çekiş va oilaviy anamnez bilan birga baholaydi.",
      ru: "**Липидограмма** измеряет жиры в крови:\n- **ЛПНП** — «плохой» холестерин; высокий уровень способствует бляшкам в сосудах\n- **ЛПВП** — «хороший» холестерин; помогает выводить избыток\n- **Триглицериды** — жиры, связанные с питанием, алкоголем и сахаром крови\n\nЦелевые значения зависят от общего сердечно-сосудистого риска, поэтому врач оценивает их вместе с возрастом, давлением, курением и наследственностью.",
      en: "A **lipid panel** measures fats in the blood:\n- **LDL** — often called \"bad\" cholesterol; high levels contribute to plaque in arteries\n- **HDL** — \"good\" cholesterol; helps remove excess cholesterol\n- **Triglycerides** — a type of fat linked to diet, alcohol and blood sugar\n\nTarget values depend on your overall cardiovascular risk, so your doctor interprets them together with age, blood pressure, smoking and family history.",
    } },
  { id: "diabetes", specialist: "endocrinology", keywords: ["diabetes", "blood sugar", "glucose", "hba1c", "a1c", "insulin", "diabet", "qand", "glyukoza", "insulin", "диабет", "сахар", "глюкоз", "инсулин"],
    answer: {
      uz: "**Qandli diabet** — organizm yetarli insulin işlab çiqarmagani yoki undan yaxşi foydalana olmagani uçun qondagi glyukoza (qand) me’yordan yuqori bölişi.\n- **HbA1c** taxminan oxirgi 3 oydagi örtaça qon qandini aks ettiradi (odatda < 5,7% me’yor, ≥ 6,5% diabet oraliğida).\n- Yuqori qand belgilari: çanqoq, tez-tez siyiş, holsizlik, köz xiralaşişi.\n\nTaşxis va davolaş böyiça qarorni şifokor takroriy tahlillar asosida qabul qiladi.",
      ru: "**Сахарный диабет** — состояние, при котором глюкоза крови выше нормы, потому что организму не хватает инсулина или он плохо его использует.\n- **HbA1c** отражает средний сахар примерно за 3 месяца (обычно < 5,7% — норма, ≥ 6,5% — диапазон диабета).\n- Признаки высокого сахара: жажда, частое мочеиспускание, усталость, нечёткое зрение.\n\nДиагноз и лечение определяет врач по повторным анализам.",
      en: "**Diabetes** means blood glucose (sugar) is higher than normal because the body doesn't make enough insulin or doesn't use it well.\n- **HbA1c** reflects average blood sugar over ~3 months (often < 5.7% is considered normal and ≥ 6.5% is in the diabetes range).\n- Common signs of high blood sugar include thirst, frequent urination, tiredness and blurred vision.\n\nDiagnosis and treatment decisions are made by a clinician based on repeated tests.",
    } },
  { id: "bmi", keywords: ["bmi", "body mass index", "overweight", "tana massasi", "ortiqcha vazn", "vazn tashla", "имт", "индекс массы", "лишний вес", "похуд"],
    answer: {
      uz: "**Tana massasi indeksi (TMI)** = vazn (kg) ÷ böy (m)². Kattalar uçun 18,5–24,9 odatda «söğlom» oraliq hisoblanadi. TMI tezkor skrining vositasi, lekin u muşak va yoğni ajratmaydi, şuning uçun bel aylanasi va umumiy salomatlik ham hisobga olinadi.",
      ru: "**Индекс массы тела (ИМТ)** = вес (кг) ÷ рост (м)². Для взрослых 18,5–24,9 обычно считается «здоровым» диапазоном. ИМТ — быстрый скрининг, но он не различает мышцы и жир, поэтому учитывают и окружность талии, и общее здоровье.",
      en: "**Body Mass Index (BMI)** = weight (kg) ÷ height (m)². For adults, 18.5–24.9 is usually labelled the \"healthy\" range. BMI is a quick screening tool but doesn't distinguish muscle from fat, so waist circumference and overall health are also considered.",
    } },
  { id: "ecg", specialist: "cardiology", keywords: ["ecg", "ekg", "electrocardiogram", "elektrokardiogramma", "экг", "кардиограмм"],
    answer: {
      uz: "**EKG (elektrokardiogramma)** yurakning elektr faolligini kökrak, qöl va oyoqlarga yopiştirilgan kiçik elektrodlar orqali yozib oladi. U tez va oğriqsiz ötadi va şifokorga yurak ritmi, urişlar soni hamda zöriqiş yoki oldingi zararlaniş belgilarini körişga yordam beradi.",
      ru: "**ЭКГ (электрокардиограмма)** записывает электрическую активность сердца через небольшие электроды на груди, руках и ногах. Это быстро и безболезненно и помогает врачу оценить ритм, частоту и признаки перегрузки или перенесённого повреждения.",
      en: "An **ECG (electrocardiogram)** records the heart's electrical activity using small stickers on the chest, arms and legs. It's quick and painless, and helps clinicians look at heart rhythm, rate and signs of strain or previous damage.",
    } },
  { id: "imaging", keywords: ["mri", "ct scan", "x-ray", "xray", "ultrasound", "mrt", "rentgen", "uzi", "utt", "kompyuter tomograf", "мрт", "кт ", "рентген", "узи"],
    answer: {
      uz: "Asosiy tasvirlaş tekşiruvlari:\n- **Rentgen** — tezkor, suyaklar va kökrak qafasi uçun qulay\n- **UTT (ultratovuş)** — nurlanişsiz; içki a’zolar, homiladorlik, qon oqimi uçun\n- **KT** — batafsil kesma rentgen tasvirlari\n- **MRT** — magnit va radiotölqinlar; miya, umurtqa, böğimlar uçun juda aniq (metall implant bölsa, xodimlarga ayting)",
      ru: "Основные методы визуализации:\n- **Рентген** — быстро, хорошо для костей и грудной клетки\n- **УЗИ** — без облучения; органы, беременность, кровоток\n- **КТ** — детальные послойные рентгеновские снимки\n- **МРТ** — магнит и радиоволны; отлично видно мозг, позвоночник, суставы (сообщите о металлических имплантах)",
      en: "Common imaging tests:\n- **X-ray** — quick images, great for bones and chest\n- **Ultrasound** — sound waves, no radiation; used for organs, pregnancy, blood flow\n- **CT** — detailed cross-sectional X-ray images\n- **MRI** — magnets and radio waves; excellent detail of brain, spine, joints and soft tissue (tell staff about any metal implants)",
    } },
  { id: "antibiotics", keywords: ["antibiotic", "virus vs bacteria", "antibiotik", "антибиотик"],
    answer: {
      uz: "**Antibiotiklar** bakterial infeksiyalarni davolaydi; ular şamollaş va köpçilik grippga öxşaş kasalliklar kabi **viruslarga ta’sir qilmaydi**. Ularni keraksiz qabul qiliş nojöya ta’sirlarga va antibiotiklarga çidamlilik paydo bölişiga olib keladi. Antibiotik kerakmi yöqmi — buni faqat şifokor hal qiladi.",
      ru: "**Антибиотики** лечат бактериальные инфекции и **не действуют на вирусы** — простуду и большинство гриппоподобных болезней. Ненужный приём вызывает побочные эффекты и способствует устойчивости бактерий. Нужен ли антибиотик — решает только врач.",
      en: "**Antibiotics** treat bacterial infections; they **don't work against viruses** such as colds and most flu-like illnesses. Using them when they're not needed can cause side effects and contributes to antibiotic resistance. Only a clinician can decide whether an antibiotic is appropriate.",
    } },
  { id: "vaccines", keywords: ["vaccine", "vaccination", "immunis", "immuniz", "booster", "vaksina", "emlash", "emlov", "прививк", "вакцин"],
    answer: {
      uz: "**Vaksinalar** immunitetni kasallikni keltirib çiqarmasdan mikrobni taniş uçun örgatadi, şunda organizm keyinroq tezroq javob bera oladi. Ba’zilari uçun **qayta emlaş** kerak, çunki himoya vaqt ötişi bilan susayadi. Yoşingiz va holatingizga qaysi vaksinalar tavsiya etilişini şifokor yoki sanitariya xizmati aytib beradi.",
      ru: "**Вакцины** учат иммунитет распознавать микроб без самой болезни, чтобы при встрече организм ответил быстрее. Для некоторых нужны **ревакцинации**, так как защита со временем ослабевает. Какие прививки рекомендованы вам — подскажет врач.",
      en: "**Vaccines** train the immune system to recognise a germ without causing the disease, so the body can respond faster if exposed later. Some need **boosters** because protection fades over time. Your doctor or local health authority can tell you which vaccines are recommended for your age and situation.",
    } },
  { id: "fever", keywords: ["fever", "temperature", "isitma", "harorat", "temperatura", "температур", "жар", "лихорад"],
    answer: {
      uz: "**Isitma** (odatda ≥ 38 °C) — organizmning infeksiyaga normal javobi. Dam oliş va köp suyuqlik içiş yordam beradi. **Şifokorga murojaat qiling**, agar isitma 3 kundan ortiq davom etsa, juda baland bölsa, böyin qotişi, bosilganda yöqolmaydigan toşma, çalkaşlik, nafas qisilişi bilan kelsa — yoki **3 oylikkaça çaqaloqda** har qanday isitma bölsa.",
      ru: "**Температура** (обычно ≥ 38 °C) — нормальная реакция организма на инфекцию. Помогают отдых и обильное питьё. **Обратитесь к врачу**, если жар держится больше 3 дней, очень высокий, сопровождается ригидностью шеи, сыпью, не бледнеющей при надавливании, спутанностью, одышкой — или при любой температуре у малыша до 3 месяцев.",
      en: "A **fever** (usually ≥ 38 °C / 100.4 °F) is the body's normal response to infection. Rest and fluids help. **Seek medical care** if a fever lasts more than 3 days, is very high, or comes with a stiff neck, rash that doesn't fade under pressure, confusion, difficulty breathing — or for any fever in a baby under 3 months.",
    } },
  { id: "headache", specialist: "neurology", keywords: ["headache", "migraine", "head pain", "bosh og'ri", "boshim og'ri", "migren", "головн", "мигрен", "болит голова"],
    answer: {
      uz: "Köpçilik **boş oğriqlari** zöriqiş turidagi oğriq yoki **migren** böladi. Migren köpinça bir tomonlama, zirqiraydigan oğriq, yoruğlik va tovuşga sezgirlik, ba’zan köngil aynişi bilan keladi. Uyqusizlik, stress, suvsizlaniş va ovqatni ötkazib yuboriş köp uçraydigan sabablar — oğriq kundaligi foydali. **Tezkor yordam kerak**: tösatdan «hayotdagi eng kuçli» boş oğriği, isitma va böyin qotişi bilan, boş jarohatidan keyin yoki holsizlik, çalkaşlik, köriş yöqolişi bilan kelgan oğriq.",
      ru: "Большинство **головных болей** — это боль напряжения или **мигрень**. Мигрень часто односторонняя, пульсирующая, со светобоязнью и тошнотой. Частые триггеры — недосып, стресс, обезвоживание и пропуск еды; поможет дневник головной боли. **Срочная помощь нужна** при внезапной «самой сильной в жизни» боли, боли с температурой и ригидностью шеи, после травмы головы или со слабостью, спутанностью, потерей зрения.",
      en: "Most **headaches** are tension-type or **migraine**. Migraine is often one-sided and throbbing, with sensitivity to light or sound and sometimes nausea. Common triggers include poor sleep, stress, dehydration and skipped meals — a headache diary helps. **Urgent care is needed** for a sudden \"worst-ever\" headache, headache with fever and stiff neck, after a head injury, or with weakness, confusion or vision loss.",
    } },
  { id: "cold_flu", specialist: "general-practice", keywords: ["cold", "flu", "influenza", "sore throat", "runny nose", "cough", "shamollash", "shamolla", "gripp", "tumov", "yo'tal", "tomog'im", "простуд", "грипп", "кашел", "насморк", "горло"],
    answer: {
      uz: "**Şamollaş** odatda asta-sekin, tumov va tomoq oğriği bilan boşlanadi; **gripp** esa köpinça tösatdan, yuqori isitma, tana qaqşaşi va kuçli holsizlik bilan boşlanadi. Ikkalasi ham virusli, şuning uçun dam oliş, suyuqlik va vaqt asosiy davo. Nafas qisilişi, kökrak oğriği, ~10 kundan ortiq davom etgan belgilar bölsa yoki xavf guruhida bölsangiz, şifokorga uçrang.",
      ru: "**Простуда** обычно начинается постепенно — насморк и боль в горле; **грипп** чаще внезапно — высокая температура, ломота и сильная слабость. Оба вирусные, поэтому главное — отдых, питьё и время. Обратитесь к врачу при одышке, боли в груди, симптомах дольше ~10 дней или если вы в группе риска.",
      en: "**Colds** usually come on gradually with a runny nose and sore throat; **flu** tends to start suddenly with fever, aches and exhaustion. Both are viral, so rest, fluids and time are the mainstays. See a clinician if you have difficulty breathing, chest pain, symptoms lasting more than ~10 days, or if you're in a higher-risk group.",
    } },
  { id: "sleep", keywords: ["sleep", "insomnia", "tired", "fatigue", "uyqu", "uxlay olma", "charcha", "holsiz", "сон", "бессонниц", "устал", "усталост"],
    answer: {
      uz: "Kattalarning köpçiligiga **7–9 soat** uyqu kerak. Foydali odatlar: bir xil uyqu tartibi, qorongi va salqin xona, keçqurun ekran va kofeinni kamaytiriş, kunduzi jismoniy faollik. Yetarli uxlasangiz ham doimiy holsizlik turli sabablarga (kamqonlik, qalqonsimon bez, uyqudagi apnoe, tuşkun kayfiyat) boğliq bölişi mumkin — buni şifokor bilan muhokama qiling.",
      ru: "Большинству взрослых нужно **7–9 часов** сна. Полезные привычки: постоянный режим, тёмная прохладная комната, меньше экранов и кофеина вечером, активность днём. Постоянная усталость при достаточном сне может иметь разные причины (анемия, щитовидная железа, апноэ сна, сниженное настроение) — обсудите это с врачом.",
      en: "Most adults need **7–9 hours** of sleep. Helpful habits: a consistent schedule, a dark and cool room, limiting screens and caffeine in the evening, and daytime physical activity. Ongoing tiredness despite enough sleep can have many causes (e.g. anaemia, thyroid issues, sleep apnoea, low mood) and is worth discussing with a doctor.",
    } },
  { id: "prepare", keywords: ["prepare", "questions for my doctor", "questions to ask", "what should i ask", "savollar tayyorla", "qabulga tayyorla", "nimani so'ra", "shifokorga savol", "подготов", "вопросы врачу", "что спросить"],
    answer: {
      uz: "Qabulga tayyorlaniş undan maksimal foyda olişga yordam beradi:\n1. **Belgilaringizni yozib qöying** — qaçon boşlangan, qanchalik tez-tez, nima yengillaştiradi yoki kuçaytiradi.\n2. **Qabul qilayotgan dori va qöşimçalaringiz** röyxatini tuzing.\n3. **Anamnezingizni** eslang — allergiyalar, ötgan kasalliklar, oilaviy kasalliklar.\n4. **3–5 ta savol tayyorlang**, masalan:\n   - *Bunga nima sabab bölişi mumkin?*\n   - *Qanday tekşiruvlar kerak va nima uçun?*\n   - *Qanday variantlar bor, ularning afzallik va kamçiliklari?*\n   - *Qaysi belgilar paydo bölsa, tezroq qaytib kelişim kerak?*\n5. Xohlasangiz, **yaqin odamingizni olib boring** va eslatmalar yozing.",
      ru: "Подготовка помогает получить максимум от визита:\n1. **Запишите симптомы** — когда начались, как часто, что облегчает или усиливает.\n2. **Составьте список лекарств и добавок**.\n3. **Вспомните анамнез** — аллергии, перенесённые болезни, наследственность.\n4. **Подготовьте 3–5 вопросов**, например:\n   - *Что может быть причиной?*\n   - *Какие обследования нужны и зачем?*\n   - *Какие есть варианты, их плюсы и минусы?*\n   - *При каких признаках нужно прийти раньше?*\n5. При желании **возьмите с собой близкого** и делайте заметки.",
      en: "Preparing for an appointment helps you get the most from it:\n1. **Write down your symptoms** — when they started, how often, what makes them better or worse.\n2. **List your medicines and supplements**, including doses.\n3. **Note your history** — allergies, past conditions, family history.\n4. **Prepare 3–5 questions**, e.g.\n   - *What could be causing this?*\n   - *Which tests do I need, and why?*\n   - *What are my options and their pros and cons?*\n   - *What warning signs should make me come back sooner?*\n5. **Bring someone** if you'd like support, and take notes.",
    } },
  { id: "lab_results", keywords: ["lab result", "blood test", "reference range", "cbc", "blood count", "haemoglobin", "hemoglobin", "tahlil", "qon tahlili", "gemoglobin", "me'yor", "анализ", "гемоглобин", "общий анализ крови", "норм"],
    answer: {
      uz: "Tahlil natijalarida qiymatingiz yonida **me’yoriy oraliq** körsatiladi — söğlom odamlarning köpçiligida uçraydigan oraliq. Oraliqdan biroz çetga çiqqan natija har doim ham muammo emas: laboratoriya, yoş va jins oraliqni özgartirişi mumkin, şifokor esa natijalarni belgilaringiz va anamnezingiz bilan birga baholaydi. **Umumiy qon tahlili** qizil qon tanaçalari (kislorod taşiydi), oq qon tanaçalari (immunitet) va trombotsitlarni (qon iviş) körsatadi.",
      ru: "В анализах рядом со значением указан **референсный интервал** — диапазон, типичный для большинства здоровых людей. Небольшое отклонение не всегда проблема: интервалы зависят от лаборатории, возраста и пола, а врач оценивает результат вместе с симптомами и анамнезом. **Общий анализ крови** показывает эритроциты (перенос кислорода), лейкоциты (иммунитет) и тромбоциты (свёртывание).",
      en: "Lab reports show your value next to a **reference range** — the range seen in most healthy people. A result slightly outside the range isn't automatically a problem; labs, age and sex can change ranges, and your doctor interprets results alongside your symptoms and history. A **CBC (complete blood count)** looks at red cells (oxygen-carrying), white cells (immune system) and platelets (clotting).",
    } },
  { id: "exercise", keywords: ["exercise", "physical activity", "workout", "steps", "jismoniy faollik", "sport", "mashq", "yurish", "физическ", "спорт", "упражнен", "тренировк"],
    answer: {
      uz: "Kattalar uçun umumiy tavsiya — haftasiga taxminan **150 daqiqa örtaça faollik** (masalan, tez yuriş) va haftada 2 kun **muşaklarni kuçaytiruvçi** maşqlar. Asta-sekin boşlang. Yurak kasalligingiz bölsa, zöriqişda kökrak oğrisa yoki uzoq vaqt harakatsiz bölgan bölsangiz, avval şifokor bilan maslahatlaşing.",
      ru: "Общая рекомендация для взрослых — около **150 минут умеренной активности** в неделю (например, быстрая ходьба) и **силовые упражнения** 2 дня в неделю. Начинайте постепенно. При болезнях сердца, боли в груди при нагрузке или долгом перерыве сначала посоветуйтесь с врачом.",
      en: "General guidance for adults is about **150 minutes of moderate activity** per week (e.g. brisk walking) plus **muscle-strengthening** on 2 days. Start gradually and build up. If you have a heart condition, chest pain on exertion, or haven't been active for a long time, check with a clinician first.",
    } },
  { id: "eyes", specialist: "ophthalmology", keywords: ["eye", "vision", "eyesight", "screen strain", "ophthalmologist", "ko'z", "ko'rish", "oftalmolog", "глаз", "зрени", "офтальмолог", "окулист"],
    answer: {
      uz: "**Kompyuterdan közning çarçaşi** uçun **20-20-20 qoidasi**ni sinab köring: har 20 daqiqada 20 soniya davomida ~6 metr uzoqlikdagi narsaga qarang. Tösatdan köriş yöqolişi, köz oldida «parda» bilan çaqnaşlar yoki oğriqli qizil köz zudlik bilan **oftalmolog** yoki tez yordam tomonidan körilişi kerak.",
      ru: "При **усталости глаз от экрана** попробуйте **правило 20-20-20**: каждые 20 минут 20 секунд смотрите на предмет на расстоянии ~6 м. Внезапная потеря зрения, вспышки с «шторкой» или болезненный красный глаз требуют срочного осмотра **офтальмологом** или скорой.",
      en: "For **digital eye strain**, try the **20-20-20 rule**: every 20 minutes, look at something 20 feet (~6 m) away for 20 seconds. Sudden vision loss, flashes with a \"curtain\" over vision, or a painful red eye need urgent assessment by an **ophthalmologist** or emergency service.",
    } },
];

/** Symptom → specialty slug. Patterns run on normalised text (any language). */
export const SPECIALIST_FOR_SYMPTOM: [RegExp, string][] = [
  [/chest|palpitat|heart|blood pressure|breathless|ko'kra[kg]|yurak|bosim|nafas qis|груд|сердц|давлен|одышк/, "cardiology"],
  [/headache|migraine|dizz|numb|tingl|seizure|memory|bosh og'ri|bosh aylan|uvish|xotira|migren|голов|мигрен|онемен|памят|судорог/, "neurology"],
  [/rash|itch|skin|mole|acne|hair|teri|toshma|qichi|xol|husnbuzar|soch|кож|сыпь|зуд|родинк|акне|волос/, "dermatology"],
  [/knee|joint|back|shoulder|ankle|bone|muscle|tizza|bo'g'im|bel|yelka|suyak|mushak|колен|сустав|спин|плеч|кост|мышц/, "orthopedics"],
  [/thirst|urinat|thyroid|weight|sugar|chanqo|siyish|qalqonsimon|vazn|qand|жажд|мочеисп|щитовид|вес|сахар/, "endocrinology"],
  [/eye|vision|blur|ko'z|ko'rish|xira|глаз|зрен|размыт/, "ophthalmology"],
  [/anx|mood|sleep|stress|panic|xavotir|kayfiyat|uyqu|stress|vahima|тревог|настроен|сон|стресс|паник/, "psychiatry"],
  [/child|baby|bola|chaqaloq|ребен|малыш/, "pediatrics"],
];
