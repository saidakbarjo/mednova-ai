import bcrypt from "bcryptjs";
import type { Queryable } from "./db";

/**
 * FICTIONAL DEMONSTRATION DATA ONLY.
 * Every person, clinic and medical value below is invented for the
 * university demonstration. No real patient information is used.
 */

export const DEMO_PASSWORD = "Demo1234!";
export const DEMO_ACCOUNTS = [
  { role: "patient", email: "patient@mednova.demo", name: "Sardor Aminov" },
  { role: "doctor", email: "doctor@mednova.demo", name: "Dr. Malika Hasanova" },
  { role: "admin", email: "admin@mednova.demo", name: "Platforma administratori" },
] as const;

const SPECIALIZATIONS = [
  ["Cardiology", "cardiology", "Yurak va qon tomirlari salomatligi: qon bosimi, ritm buzilişlari, kökrak oğriğini baholaş.", "heart-pulse"],
  ["Neurology", "neurology", "Boş miya, orqa miya va nervlar: boş oğriği, tutqanoq, uvişiş, xotira muammolari.", "brain"],
  ["Dermatology", "dermatology", "Teri, soç va tirnoqlar: toşmalar, husnbuzar, xollarni tekşiriş.", "scan-face"],
  ["Orthopedics", "orthopedics", "Suyak, böğim va muşaklar: jarohatlar, bel oğriği, artrit.", "bone"],
  ["Pediatrics", "pediatrics", "Çaqaloqlar, bolalar va ösmirlar salomatligi.", "baby"],
  ["Endocrinology", "endocrinology", "Gormonlar va moddalar almaşinuvi: diabet, qalqonsimon bez, vazn.", "activity"],
  ["Ophthalmology", "ophthalmology", "Köz salomatligi va köriş: körik, glaukoma, katarakta.", "eye"],
  ["General Practice", "general-practice", "Kundalik salomatlik masalalari va profilaktika uçun birinçi murojaat.", "stethoscope"],
  ["Psychiatry", "psychiatry", "Ruhiy salomatlik: kayfiyat, xavotir, uyqu va xulq-atvor.", "brain-circuit"],
] as const;

type DoctorSeed = {
  email: string; name: string; spec: string; title: string; bio: string; years: number; fee: number;
  clinic: string; city: string; languages: string; rating: number; reviews: number; verified: boolean;
};

const DOCTORS: DoctorSeed[] = [
  { email: "doctor@mednova.demo", name: "Dr. Malika Hasanova", spec: "cardiology", title: "t.f.n., FACC", years: 14, fee: 250000, clinic: "Yurak Salomatligi Markazi", city: "Toşkent", languages: "Özbek, Rus, Ingliz", rating: 4.9, reviews: 312, verified: true,
    bio: "Profilaktik kardiolog. Qon bosimini nazorat qiliş va bemorlarga yurak salomatligini sodda tilda tuşuntirişga ixtisoslaşgan." },
  { email: "r.karimov@mednova.demo", name: "Dr. Rustam Karimov", spec: "neurology", title: "t.f.d., professor", years: 18, fee: 300000, clinic: "Ipak Yöli Nevrologiya Klinikasi", city: "Toşkent", languages: "Özbek, Rus, Ingliz", rating: 4.8, reviews: 241, verified: true,
    bio: "Migren va uyqu bilan boğliq nevrologik holatlar böyiça mutaxassis." },
  { email: "d.yusupova@mednova.demo", name: "Dr. Dilnoza Yusupova", spec: "dermatology", title: "Oliy toifali şifokor", years: 9, fee: 180000, clinic: "Tiniq Teri Dermatologiya Markazi", city: "Samarqand", languages: "Özbek, Rus", rating: 4.7, reviews: 188, verified: true,
    bio: "Umumiy va kosmetik dermatologiya, xollarni xaritalaş va teri saratonini erta aniqlaş." },
  { email: "b.aliyev@mednova.demo", name: "Dr. Bahodir Aliyev", spec: "orthopedics", title: "t.f.n.", years: 21, fee: 320000, clinic: "Harakat Ortopediya Instituti", city: "Toşkent", languages: "Özbek, Rus, Nemis", rating: 4.8, reviews: 276, verified: true,
    bio: "Sport tibbiyoti böyiça ortoped-jarroh: tizza, yelka va yuguriş jarohatlari." },
  { email: "g.rahimova@mednova.demo", name: "Dr. Gulnora Rahimova", spec: "pediatrics", title: "Oliy toifali şifokor", years: 12, fee: 150000, clinic: "Kiçkintoy Bolalar Klinikasi", city: "Samarqand", languages: "Özbek, Rus", rating: 4.9, reviews: 402, verified: true,
    bio: "Çaqaloqlik davridan ösmirlikkaça bolalarni kuzatuvçi pediatr." },
  { email: "sh.nazarov@mednova.demo", name: "Dr. Şerzod Nazarov", spec: "endocrinology", title: "t.f.n.", years: 11, fee: 220000, clinic: "Muvozanat Endokrinologiya Markazi", city: "Buxoro", languages: "Özbek, Rus, Ingliz", rating: 4.6, reviews: 133, verified: true,
    bio: "Diabet böyiça ta’lim, qalqonsimon bez salomatligi va metabolik farovonlik bilan işlaydi." },
  { email: "k.tursunova@mednova.demo", name: "Dr. Kamola Tursunova", spec: "ophthalmology", title: "Oliy toifali şifokor", years: 16, fee: 200000, clinic: "Tiniq Nigoh Köz Markazi", city: "Toşkent", languages: "Özbek, Rus, Ingliz", rating: 4.7, reviews: 159, verified: true,
    bio: "Glaukoma skriningi va kompyuterdan közning çarçaşi böyiça oftalmolog." },
  { email: "j.ismoilov@mednova.demo", name: "Dr. Jasur Ismoilov", spec: "general-practice", title: "Oilaviy şifokor", years: 8, fee: 120000, clinic: "Oilaviy Salomatlik Nuqtasi", city: "Namangan", languages: "Özbek, Rus", rating: 4.8, reviews: 365, verified: true,
    bio: "Yaxşi davolaş tinglaşdan boşlanadi, deb hisoblaydigan oilaviy şifokor: profilaktik körik, kundalik kasalliklar va yönaltirişlar." },
  { email: "o.saidov@mednova.demo", name: "Dr. Otabek Saidov", spec: "cardiology", title: "Şifokor", years: 6, fee: 200000, clinic: "Şahar Kardiologiya Markazi", city: "Toşkent", languages: "Özbek, Rus", rating: 0, reviews: 0, verified: false,
    bio: "Sport kardiologiyasiga qiziqadigan kardiolog. (Tasdiqlaş kutilmoqda — demo.)" },
  { email: "n.qodirova@mednova.demo", name: "Dr. Nilufar Qodirova", spec: "psychiatry", title: "Şifokor", years: 7, fee: 260000, clinic: "Ruhiy Muvozanat Klinikasi", city: "Toşkent", languages: "Özbek, Rus, Ingliz", rating: 0, reviews: 0, verified: false,
    bio: "Xavotir, uyqu va yoşlar ruhiy salomatligiga ixtisoslaşgan psixiatr. (Tasdiqlaş kutilmoqda — demo.)" },
];

const PATIENTS = [
  { email: "patient@mednova.demo", name: "Sardor Aminov", dob: "1998-04-12", gender: "male", phone: "+998 90 000 00 01", blood: "A+", h: 178, w: 79.5, allergies: "Penitsillin (toşma) — xayoliy", chronic: "Yengil gipertoniya — xayoliy", ec: "Aziza Aminova (singlisi) +998 90 000 00 02" },
  { email: "n.saidova@mednova.demo", name: "Nodira Saidova", dob: "1990-09-03", gender: "female", phone: "+998 90 000 00 03", blood: "O+", h: 165, w: 61, allergies: "Yöq", chronic: "", ec: "" },
  { email: "l.karimova@mednova.demo", name: "Laylo Karimova", dob: "1985-01-22", gender: "female", phone: "+998 90 000 00 04", blood: "B+", h: 170, w: 68, allergies: "Gul çangi", chronic: "", ec: "" },
  { email: "a.tursunov@mednova.demo", name: "Aziz Tursunov", dob: "2001-06-30", gender: "male", phone: "+998 90 000 00 05", blood: "AB+", h: 175, w: 70, allergies: "Yöq", chronic: "", ec: "" },
  { email: "z.ahmedova@mednova.demo", name: "Zarina Ahmedova", dob: "1979-11-15", gender: "female", phone: "+998 90 000 00 06", blood: "A-", h: 168, w: 66, allergies: "Lateks", chronic: "2-tur diabet — xayoliy", ec: "" },
  { email: "t.aliyev@mednova.demo", name: "Timur Aliyev", dob: "1994-02-08", gender: "male", phone: "+998 90 000 00 07", blood: "O-", h: 180, w: 82, allergies: "Yöq", chronic: "", ec: "" },
];

/** Local date at hh:mm, `dayOffset` days from today. */
function at(dayOffset: number, hh: number, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

/** Push weekend dates to the next Monday so seeded slots match schedules. */
function weekday(dayOffset: number, hh: number, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + (dayOffset >= 0 ? 1 : -1));
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

export async function seedIfEmpty(db: Queryable & { transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> }) {
  const existing = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM users");
  if (existing[0]?.n > 0) return;
  await db.transaction((tx) => seed(tx));
}

async function seed(tx: Queryable) {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const insertUser = async (email: string, name: string, role: string) =>
    (await tx.query<{ id: string }>(
      "INSERT INTO users (email, password_hash, full_name, role, is_demo) VALUES ($1,$2,$3,$4,TRUE) RETURNING id",
      [email, hash, name, role],
    ))[0].id;

  const specIds: Record<string, number> = {};
  for (const [name, slug, description, icon] of SPECIALIZATIONS) {
    const r = await tx.query<{ id: number }>(
      "INSERT INTO specializations (name, slug, description, icon) VALUES ($1,$2,$3,$4) RETURNING id",
      [name, slug, description, icon],
    );
    specIds[slug] = r[0].id;
  }

  await insertUser("admin@mednova.demo", "Platform Administrator", "admin");

  const doctorIds: string[] = [];
  for (const d of DOCTORS) {
    const uid = await insertUser(d.email, d.name, "doctor");
    const r = await tx.query<{ id: string }>(
      `INSERT INTO doctors (user_id, specialization_id, title, bio, years_experience, consultation_fee, clinic_name, city,
         languages, rating, review_count, is_verified, verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, CASE WHEN $12 THEN now() ELSE NULL END) RETURNING id`,
      [uid, specIds[d.spec], d.title, d.bio, d.years, d.fee, d.clinic, d.city, d.languages, d.rating, d.reviews, d.verified],
    );
    doctorIds.push(r[0].id);
    for (let day = 1; day <= 5; day++) {
      await tx.query(
        "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_minutes) VALUES ($1,$2,'09:00','17:00',30)",
        [r[0].id, day],
      );
    }
    if (doctorIds.length % 2 === 1) {
      await tx.query(
        "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_minutes) VALUES ($1,6,'10:00','14:00',30)",
        [r[0].id],
      );
    }
  }

  const patientIds: string[] = [];
  const patientUserIds: string[] = [];
  for (const p of PATIENTS) {
    const uid = await insertUser(p.email, p.name, "patient");
    patientUserIds.push(uid);
    const r = await tx.query<{ id: string }>(
      `INSERT INTO patients (user_id, date_of_birth, gender, phone, blood_type, height_cm, weight_kg, allergies, chronic_conditions, emergency_contact)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [uid, p.dob, p.gender, p.phone, p.blood, p.h, p.w, p.allergies, p.chronic, p.ec],
    );
    patientIds.push(r[0].id);
  }

  const [hart, karimov, okafor, weiss, yusupova, marino, tanaka, petrova] = doctorIds;
  const [jordan, nodira, liam, aziz, emma, timur] = patientIds;
  void yusupova;

  type Appt = [string, string, string, string, string, string | null];
  const appts: Appt[] = [
    // Demo bemor — Sardor Aminov
    [jordan, hart, weekday(2, 10, 0), "confirmed", "Qon bosimi körsatkiçlari böyiça takroriy körik", null],
    [jordan, okafor, weekday(6, 14, 30), "pending", "Yelkadagi yangi xolni tekşiriş", null],
    [jordan, petrova, weekday(-12, 11, 0), "completed", "Yillik profilaktik körik", "Profilaktik körik. Har kuni 30 daqiqa jismoniy faollik va tuzni kamaytiriş tavsiya qilindi. (Xayoliy yozuv)"],
    [jordan, hart, weekday(-40, 9, 30), "completed", "Dorixonadagi ölçovda qon bosimi yuqori çiqdi", "Uyda qon bosimini nazorat qiliş rejasi muhokama qilindi; avval turmuş tarzi özgarişlari. 6 haftadan keyin qayta körik. (Xayoliy yozuv)"],
    [jordan, weiss, weekday(-75, 15, 0), "completed", "Yugurişdan keyin tizza oğriği", "Ortiqça yuklama ehtimoli; fizioterapiya maşqlari tavsiya qilindi. (Xayoliy yozuv)"],
    [jordan, tanaka, weekday(-20, 13, 0), "cancelled", "Kompyuterdan közning çarçaşi", null],
    // Demo şifokor — Dr. Malika Hasanova: bugungi jadval + tarix
    [nodira, hart, at(0, 9, 0), "completed", "Jismoniy maşq paytida yurak tez urişi", "EKG me’yorda. Suyuqlik va kofein böyiça tavsiyalar berildi. (Xayoliy yozuv)"],
    [liam, hart, at(0, 10, 30), "confirmed", "Xolesterin natijalarini körib çiqiş", null],
    [aziz, hart, at(0, 13, 0), "confirmed", "Sport bilan şuğullaniş uçun ruxsatnoma", null],
    [emma, hart, at(0, 15, 30), "pending", "Zinadan çiqqanda nafas qisilişi", null],
    [timur, hart, weekday(1, 11, 0), "pending", "Oilada yurak kasalligi — skrining", null],
    [emma, hart, weekday(3, 9, 0), "confirmed", "Qon bosimi böyiça takroriy körik", null],
    [nodira, hart, weekday(-7, 14, 0), "completed", "Kökrakdagi siqiliş hissini baholaş", "Ehtimol muşak-skelet sababli; belgilar özgarsa qayta murojaat qiliş. (Xayoliy yozuv)"],
    [liam, hart, weekday(-30, 10, 0), "completed", "Birlamçi kardiolog konsultatsiyasi", "Lipid profili tahlili buyurildi. (Xayoliy yozuv)"],
    [timur, hart, weekday(-15, 16, 0), "cancelled", "Muntazam yurak tekşiruvi", null],
    // Boşqa şifokorlar (platforma statistikasi uçun)
    [nodira, karimov, weekday(4, 12, 0), "confirmed", "Takrorlanuvçi migren", null],
    [liam, weiss, weekday(-5, 9, 0), "completed", "Yelka oğriği", "Rotator manjet zöriqişi. (Xayoliy yozuv)"],
    [aziz, okafor, weekday(-3, 10, 0), "completed", "Yuzdagi husnbuzar", "Teri parvarişi böyiça tavsiyalar berildi. (Xayoliy yozuv)"],
    [emma, marino, weekday(-10, 11, 30), "completed", "Diabet böyiça ta’lim maşğuloti", "HbA1c körib çiqildi. (Xayoliy yozuv)"],
    [emma, marino, weekday(8, 11, 30), "pending", "Diabet böyiça çoraklik körik", null],
    [timur, tanaka, weekday(5, 15, 0), "confirmed", "Közni tekşiriş", null],
    [aziz, petrova, weekday(-50, 9, 0), "completed", "Mavsumiy gripp belgilari", "Dam oliş va köp suyuqlik. (Xayoliy yozuv)"],
    [nodira, okafor, weekday(-60, 12, 30), "completed", "Teridagi toşma", "Kontakt dermatit. (Xayoliy yozuv)"],
    [liam, petrova, weekday(-90, 10, 30), "completed", "Umumiy körik", null],
    [timur, weiss, weekday(-100, 14, 0), "completed", "Topiq lat yeyişi", null],
    [emma, karimov, weekday(-120, 9, 30), "completed", "Boş aylaniş", null],
  ];
  const apptIds: string[] = [];
  for (const [p, d, when, status, reason, notes] of appts) {
    const r = await tx.query<{ id: string }>(
      `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status, reason, doctor_notes, cancelled_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, LEAST(now(), $3::timestamptz - interval '3 days')) RETURNING id`,
      [p, d, when, status, reason, notes, status === "cancelled" ? "patient" : null],
    );
    apptIds.push(r[0].id);
  }

  // Jordan's vitals over 8 months — powers the health charts
  const vitals = [
    [-210, 82.4, 142, 92, 78, 5.6], [-180, 81.9, 139, 90, 76, 5.5], [-150, 81.2, 137, 88, 75, 5.6],
    [-120, 80.8, 134, 87, 74, 5.4], [-90, 80.5, 132, 85, 72, 5.3], [-60, 80.1, 129, 84, 71, 5.4],
    [-30, 79.8, 127, 83, 70, 5.2], [-5, 79.5, 124, 81, 68, 5.2],
  ];
  for (const [off, weight, sys, dia, hr, glucose] of vitals) {
    await tx.query(
      `INSERT INTO medical_records (patient_id, record_type, title, summary, data, recorded_at)
       VALUES ($1,'vitals','Uyda ölçangan körsatkiçlar','Mustaqil ölçovlar (xayoliy)', $2, $3)`,
      [jordan, JSON.stringify({ weight_kg: weight, systolic: sys, diastolic: dia, heart_rate: hr, glucose_mmol: glucose }), at(off, 8)],
    );
  }
  const records: [string, string | null, number | null, string, string, string, object, string][] = [
    [jordan, petrova, 2, "visit_note", "Yillik profilaktik körik", "Profilaktik körik. Har kuni 30 daqiqa jismoniy faollik va tuzni kamaytiriş tavsiya qilindi.", {}, weekday(-12, 11, 30)],
    [jordan, hart, 3, "visit_note", "Kardiolog konsultatsiyasi", "Uyda qon bosimini nazorat qiliş rejasi muhokama qilindi; avval turmuş tarzi özgarişlari.", {}, weekday(-40, 10, 0)],
    [jordan, weiss, 4, "visit_note", "Ortoped konsultatsiyasi — tizza", "Ortiqça yuklama ehtimoli; fizioterapiya maşqlari tavsiya qilindi.", {}, weekday(-75, 15, 30)],
    [jordan, petrova, null, "lab_result", "Lipid profili", "Qiymatlar me’yoriy oraliqda (xayoliy).",
      { items: [{ name: "Umumiy xolesterin", value: 4.9, unit: "mmol/L", range: "< 5,2" }, { name: "LDL", value: 2.8, unit: "mmol/L", range: "< 3,0" }, { name: "HDL", value: 1.3, unit: "mmol/L", range: "> 1,0" }, { name: "Triglitseridlar", value: 1.4, unit: "mmol/L", range: "< 1,7" }] }, weekday(-12, 12, 0)],
    [jordan, petrova, null, "lab_result", "Umumiy qon tahlili", "Çetlaşişlar aniqlanmadi (xayoliy).",
      { items: [{ name: "Gemoglobin", value: 148, unit: "g/L", range: "130–170" }, { name: "Leykotsitlar", value: 6.1, unit: "×10⁹/L", range: "4,0–11,0" }, { name: "Trombotsitlar", value: 245, unit: "×10⁹/L", range: "150–400" }] }, weekday(-12, 12, 0)],
    [jordan, null, null, "vaccination", "Mavsumiy grippga qarşi emlaş", "Dorixonada emlandi (xayoliy).", { dose: "Har yili" }, at(-55, 17)],
    [nodira, hart, 6, "visit_note", "Kardiolog — yurak tez urişi", "EKG me’yorda. Suyuqlik va kofein böyiça tavsiyalar berildi.", {}, at(0, 9, 30)],
    [nodira, hart, 12, "visit_note", "Kardiolog — kökrakdagi siqiliş", "Ehtimol muşak-skelet sababli.", {}, weekday(-7, 14, 30)],
    [liam, hart, 13, "visit_note", "Birlamçi kardiolog konsultatsiyasi", "Lipid profili tahlili buyurildi.", {}, weekday(-30, 10, 30)],
    [emma, marino, 18, "lab_result", "HbA1c", "Ta’lim maşğulotida körib çiqildi (xayoliy).", { items: [{ name: "HbA1c", value: 7.1, unit: "%", range: "< 7,0" }] }, weekday(-10, 12, 0)],
  ];
  for (const [p, d, apptIdx, type, title, summary, data, when] of records) {
    await tx.query(
      `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, record_type, title, summary, data, recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [p, d, apptIdx === null ? null : apptIds[apptIdx], type, title, summary, JSON.stringify(data), when],
    );
  }

  const jordanUser = patientUserIds[0];
  const n = (u: string, type: string, key: string, params: object, link: string) =>
    tx.query("INSERT INTO notifications (user_id, type, title, body, params, link) VALUES ($1,$2,$3,$4,$5,$6)", [u, type, `n.${key}.t`, `n.${key}.b`, JSON.stringify(params), link]);
  await n(jordanUser, "appointment", "apptConfirmed", { doctor: "Dr. Malika Hasanova", when: weekday(2, 10, 0) }, "/dashboard/patient/appointments");
  await n(jordanUser, "record", "newRecord", { doctor: "Dr. Jasur Ismoilov", title: "Lipid profili" }, "/dashboard/patient/records");
  await n(jordanUser, "system", "welcomeDemo", {}, "/dashboard");
  const hartUser = (await tx.query<{ id: string }>("SELECT id FROM users WHERE email='doctor@mednova.demo'"))[0].id;
  await n(hartUser, "appointment", "bookingRequest", { patient: "Zarina Ahmedova", when: at(0, 15, 30) }, "/dashboard/doctor/appointments");
  await n(hartUser, "review", "newReview", { patient: "Nodira Saidova", rating: 5 }, "/dashboard/doctor");
  const adminUser = (await tx.query<{ id: string }>("SELECT id FROM users WHERE email='admin@mednova.demo'"))[0].id;
  await n(adminUser, "verification", "pendingDoctors", { count: 2 }, "/dashboard/admin/doctors");

  // Sharhlar (reviews) — completed demo appointments
  const reviews: [number, number, string][] = [
    [2, 5, "Juda e’tiborli şifokor, hamma narsani sodda tuşuntirdi."],
    [3, 5, "Qon bosimi böyiça aniq reja berdi. Raxmat!"],
    [6, 5, "Tez va professional körik."],
    [12, 4, "Yaxşi maslahat, faqat biroz kutişga töğri keldi."],
    [16, 5, "Yelka oğriği böyiça foydali maşqlar körsatdi."],
    [18, 5, "Diabet haqida köp narsani tuşundim."],
  ];
  for (const [idx, rating, comment] of reviews) {
    const [a] = await tx.query<{ patient_id: string; doctor_id: string }>("SELECT patient_id, doctor_id FROM appointments WHERE id=$1", [apptIds[idx]]);
    await tx.query("INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, comment, created_at) VALUES ($1,$2,$3,$4,$5, now() - ($6 || ' days')::interval)",
      [apptIds[idx], a.patient_id, a.doctor_id, rating, comment, String(idx + 1)]);
  }

  // Sample AI conversation for the demo patient
  const conv = await tx.query<{ id: string }>(
    "INSERT INTO conversations (user_id, title) VALUES ($1,'Kardiolog nima bilan şuğullanadi?') RETURNING id",
    [jordanUser],
  );
  await tx.query("INSERT INTO messages (conversation_id, role, content, source) VALUES ($1,'user','Kardiolog nima bilan şuğullanadi?','user')", [conv[0].id]);
  await tx.query(
    "INSERT INTO messages (conversation_id, role, content, source) VALUES ($1,'assistant',$2,'demo')",
    [conv[0].id, "**Kardiolog** — yurak va qon tomirlari böyiça mutaxassis. U kökrakdagi noqulaylik, yurak urişining buzilişi yoki zöriqişda nafas qisilişi kabi belgilarni tekşiradi, yuqori qon bosimini nazorat qiladi hamda **EKG** yoki **exokardiografiya** kabi tekşiruvlarni buyuradi.\n\n_Bu umumiy ta’limiy ma’lumot, taşxis emas._"],
  );
}
