import bcrypt from "bcryptjs";
import type { Queryable } from "./db";

/**
 * FICTIONAL DEMONSTRATION DATA ONLY.
 * Every person, clinic and medical value below is invented for the
 * university demonstration. No real patient information is used.
 */

export const DEMO_PASSWORD = "Demo1234!";
export const DEMO_ACCOUNTS = [
  { role: "patient", email: "patient@mednova.demo", name: "Jordan Ellis" },
  { role: "doctor", email: "doctor@mednova.demo", name: "Dr. Amelia Hart" },
  { role: "admin", email: "admin@mednova.demo", name: "Platform Administrator" },
] as const;

const SPECIALIZATIONS = [
  ["Cardiology", "cardiology", "Heart and blood vessel health: blood pressure, rhythm problems, chest pain evaluation.", "heart-pulse"],
  ["Neurology", "neurology", "Brain, spinal cord and nerves: headaches, seizures, numbness, memory concerns.", "brain"],
  ["Dermatology", "dermatology", "Skin, hair and nails: rashes, acne, moles and skin cancer screening.", "scan-face"],
  ["Orthopedics", "orthopedics", "Bones, joints, muscles and ligaments: injuries, back pain, arthritis.", "bone"],
  ["Pediatrics", "pediatrics", "Medical care for infants, children and teenagers.", "baby"],
  ["Endocrinology", "endocrinology", "Hormones and metabolism: diabetes, thyroid disorders, weight.", "activity"],
  ["Ophthalmology", "ophthalmology", "Eye health and vision: check-ups, glaucoma, cataracts.", "eye"],
  ["General Practice", "general-practice", "First point of contact for everyday health concerns and prevention.", "stethoscope"],
  ["Psychiatry", "psychiatry", "Mental health: mood, anxiety, sleep and behavioural concerns.", "brain-circuit"],
] as const;

type DoctorSeed = {
  email: string; name: string; spec: string; title: string; bio: string; years: number; fee: number;
  clinic: string; city: string; languages: string; rating: number; reviews: number; verified: boolean;
};

const DOCTORS: DoctorSeed[] = [
  { email: "doctor@mednova.demo", name: "Dr. Amelia Hart", spec: "cardiology", title: "MD, FACC", years: 14, fee: 60, clinic: "Northbridge Heart Centre", city: "Tashkent", languages: "English, Russian", rating: 4.9, reviews: 312, verified: true,
    bio: "Preventive cardiologist focused on blood-pressure management and helping patients understand their heart health in plain language." },
  { email: "r.karimov@mednova.demo", name: "Dr. Rustam Karimov", spec: "neurology", title: "MD, PhD", years: 18, fee: 70, clinic: "Silk Road Neuro Clinic", city: "Tashkent", languages: "Uzbek, Russian, English", rating: 4.8, reviews: 241, verified: true,
    bio: "Neurologist specialising in migraine and sleep-related neurological conditions." },
  { email: "l.okafor@mednova.demo", name: "Dr. Lina Okafor", spec: "dermatology", title: "MD", years: 9, fee: 45, clinic: "ClearSkin Dermatology", city: "Turin", languages: "English, Italian", rating: 4.7, reviews: 188, verified: true,
    bio: "General and cosmetic dermatology with a special interest in mole mapping and early skin-cancer detection." },
  { email: "d.weiss@mednova.demo", name: "Dr. Daniel Weiss", spec: "orthopedics", title: "MD, FRCS", years: 21, fee: 80, clinic: "Motion Orthopaedic Institute", city: "Turin", languages: "English, German", rating: 4.8, reviews: 276, verified: true,
    bio: "Sports-medicine orthopaedic surgeon treating knee, shoulder and running injuries." },
  { email: "m.yusupova@mednova.demo", name: "Dr. Malika Yusupova", spec: "pediatrics", title: "MD", years: 12, fee: 40, clinic: "Little Steps Children's Clinic", city: "Samarkand", languages: "Uzbek, Russian", rating: 4.9, reviews: 402, verified: true,
    bio: "Paediatrician caring for children from newborn check-ups through adolescence." },
  { email: "s.marino@mednova.demo", name: "Dr. Sofia Marino", spec: "endocrinology", title: "MD", years: 11, fee: 55, clinic: "Equilibrio Endocrine Care", city: "Turin", languages: "Italian, English", rating: 4.6, reviews: 133, verified: true,
    bio: "Endocrinologist working with patients on diabetes education, thyroid health and metabolic wellbeing." },
  { email: "k.tanaka@mednova.demo", name: "Dr. Kenji Tanaka", spec: "ophthalmology", title: "MD", years: 16, fee: 50, clinic: "Clear Vision Eye Centre", city: "Tashkent", languages: "English, Japanese", rating: 4.7, reviews: 159, verified: true,
    bio: "Comprehensive ophthalmologist focused on glaucoma screening and digital eye strain." },
  { email: "e.petrova@mednova.demo", name: "Dr. Elena Petrova", spec: "general-practice", title: "MD", years: 8, fee: 30, clinic: "Family Health Point", city: "Bukhara", languages: "Russian, Uzbek, English", rating: 4.8, reviews: 365, verified: true,
    bio: "Family physician who believes great care starts with listening — preventive check-ups, everyday illness and referrals." },
  { email: "o.haddad@mednova.demo", name: "Dr. Omar Haddad", spec: "cardiology", title: "MD", years: 6, fee: 50, clinic: "CityCare Cardiology", city: "Tashkent", languages: "Arabic, English", rating: 0, reviews: 0, verified: false,
    bio: "Cardiologist with an interest in sports cardiology. (Awaiting verification — demo.)" },
  { email: "g.liu@mednova.demo", name: "Dr. Grace Liu", spec: "psychiatry", title: "MD", years: 7, fee: 65, clinic: "Mindful Path Clinic", city: "Turin", languages: "English, Mandarin", rating: 0, reviews: 0, verified: false,
    bio: "Psychiatrist focused on anxiety, sleep and young-adult mental health. (Awaiting verification — demo.)" },
];

const PATIENTS = [
  { email: "patient@mednova.demo", name: "Jordan Ellis", dob: "1998-04-12", gender: "male", phone: "+998 90 000 0001", blood: "A+", h: 178, w: 79.5, allergies: "Penicillin (rash) — fictional", chronic: "Mild hypertension — fictional", ec: "Taylor Ellis (sibling) +998 90 000 0002" },
  { email: "n.saidova@mednova.demo", name: "Nodira Saidova", dob: "1990-09-03", gender: "female", phone: "+998 90 000 0003", blood: "O+", h: 165, w: 61, allergies: "None", chronic: "", ec: "" },
  { email: "l.carter@mednova.demo", name: "Liam Carter", dob: "1985-01-22", gender: "male", phone: "+39 300 000 0004", blood: "B+", h: 183, w: 88, allergies: "Pollen", chronic: "", ec: "" },
  { email: "a.tursunov@mednova.demo", name: "Aziz Tursunov", dob: "2001-06-30", gender: "male", phone: "+998 90 000 0005", blood: "AB+", h: 175, w: 70, allergies: "None", chronic: "", ec: "" },
  { email: "e.novak@mednova.demo", name: "Emma Novak", dob: "1979-11-15", gender: "female", phone: "+39 300 000 0006", blood: "A-", h: 168, w: 66, allergies: "Latex", chronic: "Type 2 diabetes — fictional", ec: "" },
  { email: "t.aliev@mednova.demo", name: "Timur Aliev", dob: "1994-02-08", gender: "male", phone: "+998 90 000 0007", blood: "O-", h: 180, w: 82, allergies: "None", chronic: "", ec: "" },
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

  type Appt = [string, string, string, string, string, string | null];
  const appts: Appt[] = [
    // Demo patient — Jordan Ellis
    [jordan, hart, weekday(2, 10, 0), "confirmed", "Follow-up on blood pressure readings", null],
    [jordan, okafor, weekday(6, 14, 30), "pending", "Check a new mole on the shoulder", null],
    [jordan, petrova, weekday(-12, 11, 0), "completed", "Annual check-up", "Routine check-up. Advised 30 min of daily activity and reduced salt intake. (Fictional note)"],
    [jordan, hart, weekday(-40, 9, 30), "completed", "Elevated blood pressure at pharmacy screening", "Home BP monitoring plan discussed; lifestyle measures first. Review in 6 weeks. (Fictional note)"],
    [jordan, weiss, weekday(-75, 15, 0), "completed", "Knee pain after running", "Likely overuse; physiotherapy exercises recommended. (Fictional note)"],
    [jordan, tanaka, weekday(-20, 13, 0), "cancelled", "Eye strain from screen work", null],
    // Demo doctor — Dr. Amelia Hart: today's agenda + history
    [nodira, hart, at(0, 9, 0), "completed", "Palpitations during exercise", "ECG normal. Hydration and caffeine guidance given. (Fictional note)"],
    [liam, hart, at(0, 10, 30), "confirmed", "Cholesterol results review", null],
    [aziz, hart, at(0, 13, 0), "confirmed", "Sports clearance consultation", null],
    [emma, hart, at(0, 15, 30), "pending", "Shortness of breath on stairs", null],
    [timur, hart, weekday(1, 11, 0), "pending", "Family history of heart disease — screening", null],
    [emma, hart, weekday(3, 9, 0), "confirmed", "Blood pressure follow-up", null],
    [nodira, hart, weekday(-7, 14, 0), "completed", "Chest tightness evaluation", "Musculoskeletal cause most likely; return if symptoms change. (Fictional note)"],
    [liam, hart, weekday(-30, 10, 0), "completed", "Initial cardiology consultation", "Lipid panel ordered. (Fictional note)"],
    [timur, hart, weekday(-15, 16, 0), "cancelled", "Routine heart check", null],
    // Other doctors (platform-wide analytics)
    [nodira, karimov, weekday(4, 12, 0), "confirmed", "Recurring migraines", null],
    [liam, weiss, weekday(-5, 9, 0), "completed", "Shoulder pain", "Rotator cuff strain. (Fictional note)"],
    [aziz, yusupova, weekday(-3, 10, 0), "completed", "Vaccination question for younger sibling", "Information provided. (Fictional note)"],
    [emma, marino, weekday(-10, 11, 30), "completed", "Diabetes education session", "HbA1c reviewed. (Fictional note)"],
    [emma, marino, weekday(8, 11, 30), "pending", "Quarterly diabetes review", null],
    [timur, tanaka, weekday(5, 15, 0), "confirmed", "Vision check", null],
    [aziz, petrova, weekday(-50, 9, 0), "completed", "Seasonal flu symptoms", "Rest and fluids. (Fictional note)"],
    [nodira, okafor, weekday(-60, 12, 30), "completed", "Skin rash", "Contact dermatitis. (Fictional note)"],
    [liam, petrova, weekday(-90, 10, 30), "completed", "General check-up", null],
    [timur, weiss, weekday(-100, 14, 0), "completed", "Ankle sprain", null],
    [emma, karimov, weekday(-120, 9, 30), "completed", "Dizziness", null],
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
       VALUES ($1,'vitals','Home vitals log','Self-recorded measurements (fictional)', $2, $3)`,
      [jordan, JSON.stringify({ weight_kg: weight, systolic: sys, diastolic: dia, heart_rate: hr, glucose_mmol: glucose }), at(off, 8)],
    );
  }
  const records: [string, string | null, number | null, string, string, string, object, string][] = [
    [jordan, petrova, 2, "visit_note", "Annual check-up", "Routine check-up. Advised 30 min of daily activity and reduced salt intake.", {}, weekday(-12, 11, 30)],
    [jordan, hart, 3, "visit_note", "Cardiology consultation", "Home BP monitoring plan discussed; lifestyle measures first.", {}, weekday(-40, 10, 0)],
    [jordan, weiss, 4, "visit_note", "Orthopaedic consultation — knee", "Likely overuse; physiotherapy exercises recommended.", {}, weekday(-75, 15, 30)],
    [jordan, petrova, null, "lab_result", "Lipid panel", "Values within reference range (fictional).",
      { items: [{ name: "Total cholesterol", value: 4.9, unit: "mmol/L", range: "< 5.2" }, { name: "LDL", value: 2.8, unit: "mmol/L", range: "< 3.0" }, { name: "HDL", value: 1.3, unit: "mmol/L", range: "> 1.0" }, { name: "Triglycerides", value: 1.4, unit: "mmol/L", range: "< 1.7" }] }, weekday(-12, 12, 0)],
    [jordan, petrova, null, "lab_result", "Complete blood count", "No abnormalities flagged (fictional).",
      { items: [{ name: "Haemoglobin", value: 148, unit: "g/L", range: "130–170" }, { name: "WBC", value: 6.1, unit: "×10⁹/L", range: "4.0–11.0" }, { name: "Platelets", value: 245, unit: "×10⁹/L", range: "150–400" }] }, weekday(-12, 12, 0)],
    [jordan, null, null, "vaccination", "Seasonal influenza vaccine", "Administered at community pharmacy (fictional).", { dose: "Annual" }, at(-55, 17)],
    [nodira, hart, 6, "visit_note", "Cardiology — palpitations", "ECG normal. Hydration and caffeine guidance given.", {}, at(0, 9, 30)],
    [nodira, hart, 12, "visit_note", "Cardiology — chest tightness", "Musculoskeletal cause most likely.", {}, weekday(-7, 14, 30)],
    [liam, hart, 13, "visit_note", "Initial cardiology consultation", "Lipid panel ordered.", {}, weekday(-30, 10, 30)],
    [emma, marino, 18, "lab_result", "HbA1c", "Reviewed during education session (fictional).", { items: [{ name: "HbA1c", value: 7.1, unit: "%", range: "< 7.0" }] }, weekday(-10, 12, 0)],
  ];
  for (const [p, d, apptIdx, type, title, summary, data, when] of records) {
    await tx.query(
      `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, record_type, title, summary, data, recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [p, d, apptIdx === null ? null : apptIds[apptIdx], type, title, summary, JSON.stringify(data), when],
    );
  }

  const jordanUser = patientUserIds[0];
  const notes: [string, string, string, string, string][] = [
    [jordanUser, "appointment", "Appointment confirmed", "Dr. Amelia Hart confirmed your follow-up visit.", "/dashboard/patient/appointments"],
    [jordanUser, "record", "New lab results available", "Your lipid panel and blood count were added to your records.", "/dashboard/patient/records"],
    [jordanUser, "system", "Welcome to MEDNOVA AI", "This is a demonstration account with fictional data.", "/dashboard"],
  ];
  for (const [u, type, title, body, link] of notes) {
    await tx.query("INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)", [u, type, title, body, link]);
  }
  const hartUser = await tx.query<{ id: string }>("SELECT id FROM users WHERE email='doctor@mednova.demo'");
  await tx.query(
    "INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,'appointment','New booking request','Emma Novak requested an appointment today at 15:30.','/dashboard/doctor/appointments')",
    [hartUser[0].id],
  );
  const adminUser = await tx.query<{ id: string }>("SELECT id FROM users WHERE email='admin@mednova.demo'");
  await tx.query(
    "INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,'verification','2 doctors awaiting verification','Review credentials for Dr. Omar Haddad and Dr. Grace Liu.','/dashboard/admin/doctors')",
    [adminUser[0].id],
  );

  // Sample AI conversation for the demo patient
  const conv = await tx.query<{ id: string }>(
    "INSERT INTO conversations (user_id, title) VALUES ($1,'What does a cardiologist do?') RETURNING id",
    [jordanUser],
  );
  await tx.query("INSERT INTO messages (conversation_id, role, content, source) VALUES ($1,'user','What does a cardiologist do?','user')", [conv[0].id]);
  await tx.query(
    "INSERT INTO messages (conversation_id, role, content, source) VALUES ($1,'assistant',$2,'demo')",
    [conv[0].id, "A **cardiologist** is a doctor who specialises in the heart and blood vessels. They evaluate symptoms such as chest discomfort, palpitations or breathlessness, manage conditions like high blood pressure, and order tests such as an ECG or echocardiogram.\n\n_This is general educational information, not a diagnosis._"],
  );
}
