/**
 * End-to-end API test suite.  Usage:  npm run test:api   (server must be running)
 * BASE_URL defaults to http://localhost:3000
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let passed = 0, failed = 0;

class Client {
  cookie = "";
  constructor(public lang = "en") {}
  async call(method: string, path: string, body?: unknown) {
    const res = await fetch(BASE + path, {
      method,
      headers: { "content-type": "application/json", cookie: [`mednova_lang=${this.lang}`, this.cookie].filter(Boolean).join("; ") },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
    });
    const set = res.headers.get("set-cookie");
    if (set) this.cookie = set.split(";")[0];
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  }
  login(email: string) { return this.call("POST", "/api/auth/login", { email, password: "Demo1234!" }); }
}

function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}`, extra ?? ""); }
}

function nextWeekday(daysAhead: number) {
  const d = new Date(); d.setDate(d.getDate() + daysAhead);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  console.log(`\nMEDNOVA AI API tests → ${BASE}\n`);
  const anon = new Client(), patient = new Client(), doctor = new Client(), admin = new Client();

  console.log("Health & public");
  let r = await anon.call("GET", "/api/health");
  check("GET /api/health → 200", r.status === 200 && r.json.success, r.json);
  r = await anon.call("GET", "/api/specializations");
  check("GET /api/specializations lists 9", r.json?.data?.length === 9);
  r = await anon.call("GET", "/api/doctors");
  check("GET /api/doctors returns only verified doctors", r.json.data.length === 8 && r.json.data.every((d: { is_verified: boolean }) => d.is_verified));
  check("public doctor list hides emails", r.json.data.every((d: Record<string, unknown>) => !("email" in d)));
  const hartId = r.json.data.find((d: { full_name: string }) => d.full_name === "Dr. Malika Hasanova").id;
  r = await anon.call("GET", "/api/doctors?specialization=cardiology");
  check("filter by specialization", r.json.data.length === 1 && r.json.data[0].specialization_slug === "cardiology");
  r = await anon.call("GET", `/api/doctors/${hartId}`);
  check("GET /api/doctors/:id with schedule", r.status === 200 && r.json.data.schedule.length >= 5);

  console.log("\nAuthentication");
  r = await anon.call("GET", "/api/auth/me");
  check("GET /api/auth/me without session → 401", r.status === 401 && r.json.error.code === "UNAUTHORIZED");
  r = await anon.call("POST", "/api/auth/login", { email: "patient@mednova.demo", password: "wrong-password1" });
  check("wrong password → 401", r.status === 401);
  r = await anon.call("POST", "/api/auth/login", { email: "not-an-email", password: "x" });
  check("invalid email → 422 validation", r.status === 422 && r.json.error.code === "VALIDATION_ERROR");
  r = await patient.login("patient@mednova.demo");
  check("patient login", r.status === 200 && r.json.data.user.role === "patient");
  check("session cookie is set (httpOnly JWT)", patient.cookie.startsWith("mednova_session="));
  r = await doctor.login("doctor@mednova.demo");
  check("doctor login", r.status === 200 && r.json.data.user.role === "doctor");
  r = await admin.login("admin@mednova.demo");
  check("admin login", r.status === 200 && r.json.data.user.role === "admin");
  r = await patient.call("GET", "/api/auth/me");
  check("GET /api/auth/me", r.status === 200 && r.json.data.user.email === "patient@mednova.demo");
  r = await patient.call("GET", "/api/auth/me");

  const email = `student${Date.now()}@example.com`;
  const fresh = new Client();
  r = await fresh.call("POST", "/api/auth/register", { full_name: "Test Student", email, password: "short" });
  check("register rejects weak password", r.status === 422);
  r = await fresh.call("POST", "/api/auth/register", { full_name: "Test Student", email, password: "Student123" });
  check("register new patient → 201", r.status === 201 && r.json.data.user.patient_id);
  r = await fresh.call("POST", "/api/auth/register", { full_name: "Test Student", email, password: "Student123" });
  check("duplicate email → 409", r.status === 409);
  r = await fresh.call("POST", "/api/auth/logout");
  r = await fresh.call("GET", "/api/auth/me");
  check("logout clears session", r.status === 401);

  console.log("\nRole-based access control");
  r = await patient.call("GET", "/api/admin/users");
  check("patient → admin users = 403", r.status === 403);
  r = await doctor.call("POST", "/api/appointments", {});
  check("doctor cannot book as patient = 403", r.status === 403);
  r = await admin.call("GET", "/api/patients/records");
  check("admin cannot read clinical records = 403", r.status === 403);
  r = await patient.call("PUT", `/api/doctors/${hartId}`, { bio: "hacked" });
  check("patient cannot edit doctor profile = 403", r.status === 403);
  r = await doctor.call("PUT", `/api/doctors/${hartId}`, { is_verified: true });
  check("doctor cannot self-verify = 403", r.status === 403);

  console.log("\nPatients");
  r = await patient.call("GET", "/api/patients/profile");
  check("GET /api/patients/profile", r.status === 200 && r.json.data.blood_type === "A+");
  r = await patient.call("PUT", "/api/patients/profile", { phone: "+998 90 123 4567", height_cm: 179 });
  check("PUT /api/patients/profile", r.status === 200 && r.json.data.height_cm === 179);
  r = await patient.call("PUT", "/api/patients/profile", { blood_type: "Z+" });
  check("profile validation rejects bad blood type", r.status === 422);
  r = await patient.call("GET", "/api/patients/records");
  check("GET /api/patients/records", r.status === 200 && r.json.data.length >= 10);
  r = await patient.call("POST", "/api/patients/records", { systolic: 122, diastolic: 80, heart_rate: 66 });
  check("patient logs vitals → 201", r.status === 201);

  console.log("\nAppointments");
  const date = nextWeekday(9);
  r = await patient.call("GET", `/api/doctors/${hartId}/slots?date=${date}`);
  const slot = r.json.data.slots.find((s: { available: boolean }) => s.available);
  check("GET slots returns available times", r.status === 200 && !!slot);
  r = await patient.call("POST", "/api/appointments", { doctor_id: hartId, scheduled_at: slot.time, reason: "Automated test booking" });
  check("POST /api/appointments → 201 pending", r.status === 201 && r.json.data.status === "pending", r.json);
  const apptId = r.json.data?.id;
  r = await patient.call("POST", "/api/appointments", { doctor_id: hartId, scheduled_at: slot.time, reason: "Double booking" });
  check("double booking blocked → 409", r.status === 409);
  const bad = new Date(`${date}T03:00:00`).toISOString();
  r = await patient.call("POST", "/api/appointments", { doctor_id: hartId, scheduled_at: bad, reason: "Night visit" });
  check("outside working hours → 400", r.status === 400);
  r = await patient.call("PUT", `/api/appointments/${apptId}`, { status: "confirmed" });
  check("patient cannot confirm own booking → 400", r.status === 400);
  r = await doctor.call("PUT", `/api/appointments/${apptId}`, { status: "confirmed" });
  check("doctor confirms → confirmed", r.status === 200 && r.json.data.status === "confirmed");
  r = await doctor.call("PUT", `/api/appointments/${apptId}`, { status: "completed", doctor_notes: "Test visit note." });
  check("doctor completes with notes", r.status === 200 && r.json.data.status === "completed");
  r = await patient.call("GET", "/api/patients/records?type=visit_note");
  check("completion created a visit record", r.json.data.some((x: { summary: string }) => x.summary === "Test visit note."));
  r = await patient.call("GET", "/api/appointments?scope=upcoming");
  check("GET /api/appointments?scope=upcoming", r.status === 200 && r.json.data.every((a: { status: string }) => ["pending", "confirmed"].includes(a.status)));
  r = await doctor.call("GET", "/api/appointments?scope=today");
  check("doctor sees today's agenda", r.status === 200 && r.json.data.length >= 1);
  const slot2 = (await patient.call("GET", `/api/doctors/${hartId}/slots?date=${date}`)).json.data.slots.filter((s: { available: boolean }) => s.available)[1];
  r = await patient.call("POST", "/api/appointments", { doctor_id: hartId, scheduled_at: slot2.time, reason: "To be cancelled" });
  r = await patient.call("DELETE", `/api/appointments/${r.json.data.id}`);
  check("DELETE (patient) cancels appointment", r.status === 200 && r.json.data.status === "cancelled");
  r = await doctor.call("GET", `/api/appointments/${apptId}`);
  check("doctor can read own appointment", r.status === 200);
  const otherDoctor = new Client(); await otherDoctor.login("r.karimov@mednova.demo");
  r = await otherDoctor.call("GET", `/api/appointments/${apptId}`);
  check("another doctor cannot see it → 404", r.status === 404);

  console.log("\nDoctor features");
  r = await doctor.call("GET", "/api/doctor/patients");
  check("GET /api/doctor/patients", r.status === 200 && r.json.data.length >= 5);
  const pid = r.json.data[0].patient_id;
  r = await doctor.call("GET", `/api/patients/records?patient_id=${pid}`);
  check("doctor reads own patient's records", r.status === 200);
  r = await otherDoctor.call("GET", `/api/patients/records?patient_id=${pid}`);
  check("unrelated doctor blocked from records → 403", r.status === 403);
  r = await doctor.call("PUT", `/api/doctors/${hartId}`, { bio: "Updated bio from test suite.", schedule: [1, 2, 3, 4, 5].map((d) => ({ day_of_week: d, start_time: "09:00", end_time: "17:00", slot_minutes: 30, is_active: true })).concat([{ day_of_week: 6, start_time: "10:00", end_time: "14:00", slot_minutes: 30, is_active: true }]) });
  check("doctor updates profile + schedule", r.status === 200 && r.json.data.schedule.length === 6);

  console.log("\nAdmin");
  r = await admin.call("GET", "/api/doctors?include_unverified=1");
  const pending = r.json.data.filter((d: { is_verified: boolean }) => !d.is_verified);
  check("admin sees unverified doctors", pending.length >= 2);
  r = await admin.call("PUT", `/api/doctors/${pending[0].id}`, { is_verified: true });
  check("admin verifies doctor", r.status === 200 && r.json.data.is_verified === true);
  r = await admin.call("PUT", `/api/doctors/${pending[0].id}`, { is_verified: false });
  r = await admin.call("POST", "/api/doctors", { full_name: "Dr. Test Created", email: `doc${Date.now()}@example.com`, password: "Doctor123", specialization_id: 1 });
  check("POST /api/doctors (admin) → 201", r.status === 201);
  r = await admin.call("GET", "/api/admin/users?role=patient");
  check("GET /api/admin/users", r.status === 200 && r.json.data.length >= 6);
  const target = r.json.data.find((u: { email: string }) => u.email === email);
  r = await admin.call("PUT", `/api/admin/users/${target.id}`, { is_active: false });
  check("admin deactivates user", r.status === 200 && r.json.data.is_active === false);
  r = await fresh.call("POST", "/api/auth/login", { email, password: "Student123" });
  check("deactivated user cannot log in → 403", r.status === 403);

  console.log("\nAnalytics");
  r = await admin.call("GET", "/api/analytics/overview");
  check("admin analytics", r.status === 200 && r.json.data.totals.users >= 18 && r.json.data.monthly.length > 0);
  r = await doctor.call("GET", "/api/analytics/overview");
  check("doctor analytics", r.status === 200 && r.json.data.role === "doctor");
  r = await patient.call("GET", "/api/analytics/overview");
  check("patient analytics with vitals series", r.status === 200 && r.json.data.vitals.length >= 8);

  console.log("\nAI assistant");
  r = await patient.call("POST", "/api/ai/chat", { message: "What does a neurologist do?" });
  check("AI chat returns educational answer", r.status === 200 && /neurologist/i.test(r.json.data.assistant_message.content));
  const conv = r.json.data.conversation_id;
  r = await patient.call("POST", "/api/ai/chat", { message: "I have crushing chest pain spreading to my left arm", conversation_id: conv });
  check("emergency detected → emergency services message", r.json.data.assistant_message.is_emergency === true && /103|112/.test(r.json.data.assistant_message.content));
  r = await patient.call("POST", "/api/ai/chat", { message: "How many mg of ibuprofen should I take?", conversation_id: conv });
  check("dosage request declined", /can't recommend medications, doses/i.test(r.json.data.assistant_message.content));
  r = await patient.call("GET", `/api/ai/conversations/${conv}`);
  check("conversation history stored (6 messages)", r.json.data.messages.length === 6);
  r = await doctor.call("GET", `/api/ai/conversations/${conv}`);
  check("other user cannot read conversation → 404", r.status === 404);
  r = await patient.call("GET", "/api/ai/conversations");
  check("GET /api/ai/conversations", r.status === 200 && r.json.data.conversations.length >= 2);
  r = await patient.call("POST", "/api/ai/symptom-information", { symptoms: ["headache", "blurred vision"], duration: "days" });
  check("POST /api/ai/symptom-information", r.status === 200 && r.json.data.suggested_specialists.includes("neurology") && /not a diagnosis/.test(r.json.data.disclaimer));

  console.log("\nLocalization (uz / uz-old / ru)");
  const uzc = new Client("uz"); await uzc.login("patient@mednova.demo");
  r = await uzc.call("POST", "/api/ai/chat", { message: "Nevrolog nima bilan shug'ullanadi?" });
  check("uz: AI answers in Uzbek (new alphabet)", /Nevrolog/.test(r.json.data.assistant_message.content) && /ş|ğ|ö/.test(r.json.data.assistant_message.content));
  r = await uzc.call("POST", "/api/ai/chat", { message: "Ko'kragimda kuchli og'riq, chap qo'limga tarqalyapti" });
  check("uz: emergency detected in Uzbek → 103", r.json.data.assistant_message.is_emergency === true && /103/.test(r.json.data.assistant_message.content));
  r = await uzc.call("POST", "/api/ai/chat", { message: "Ibuprofendan necha mg ichsam bo'ladi?" });
  check("uz: dosage request declined in Uzbek", /doza|retsept/i.test(r.json.data.assistant_message.content) && r.json.data.assistant_message.source === "safety");
  const old = new Client("uz-old"); await old.login("patient@mednova.demo");
  r = await old.call("POST", "/api/ai/chat", { message: "Kardiolog nima qiladi?" });
  check("uz-old: answer converted to current alphabet (o‘, sh)", /o‘|sh/.test(r.json.data.assistant_message.content) && !/ş|ö/.test(r.json.data.assistant_message.content));
  const ruc = new Client("ru"); await ruc.login("patient@mednova.demo");
  r = await ruc.call("POST", "/api/ai/chat", { message: "Чем занимается кардиолог?" });
  check("ru: AI answers in Russian", /Кардиолог/.test(r.json.data.assistant_message.content));
  r = await ruc.call("POST", "/api/ai/chat", { message: "Не могу дышать, губы посинели" });
  check("ru: emergency detected in Russian", r.json.data.assistant_message.is_emergency === true);
  r = await new Client("uz").call("POST", "/api/auth/login", { email: "nobody@mednova.demo", password: "wrong-pass-1" });
  check("uz: API error message translated", r.status === 401 && /parol/i.test(r.json.error.message));
  r = await new Client("ru").call("POST", "/api/auth/login", { email: "x", password: "y" });
  check("ru: validation message translated", r.status === 422 && /почт/i.test(r.json.error.message));
  r = await uzc.call("GET", "/api/notifications");
  check("notifications are i18n keys + params", r.json.data.some((n: { title: string; params: object }) => n.title.startsWith("n.") && typeof n.params === "object"));

  console.log("\nReviews");
  r = await patient.call("GET", "/api/appointments?scope=past");
  const toRate = r.json.data.find((a: { status: string; my_rating: number | null }) => a.status === "completed" && !a.my_rating);
  const rated = r.json.data.find((a: { my_rating: number | null }) => a.my_rating);
  check("appointments expose my_rating", !!rated && !!toRate);
  const before = (await anon.call("GET", `/api/doctors/${toRate.doctor_id}`)).json.data.review_count;
  r = await patient.call("POST", "/api/reviews", { appointment_id: toRate.id, rating: 5, comment: "Juda yaxşi!" });
  check("POST /api/reviews → 201", r.status === 201);
  r = await patient.call("POST", "/api/reviews", { appointment_id: toRate.id, rating: 4 });
  check("second review for same visit → 409", r.status === 409);
  r = await patient.call("POST", "/api/reviews", { appointment_id: rated.id, rating: 9 });
  check("rating out of range → 422", r.status === 422);
  const upcomingA = (await patient.call("GET", "/api/appointments?scope=upcoming")).json.data[0];
  r = await patient.call("POST", "/api/reviews", { appointment_id: upcomingA.id, rating: 5 });
  check("cannot review a non-completed visit → 400", r.status === 400);
  r = await doctor.call("POST", "/api/reviews", { appointment_id: toRate.id, rating: 5 });
  check("doctor cannot post reviews → 403", r.status === 403);
  const after = (await anon.call("GET", `/api/doctors/${toRate.doctor_id}`)).json.data.review_count;
  check("doctor review_count incremented", after === before + 1);
  r = await anon.call("GET", `/api/doctors/${toRate.doctor_id}/reviews`);
  check("GET /api/doctors/:id/reviews (names shortened)", r.status === 200 && r.json.data.length > 0 && r.json.data.every((x: { author: string }) => !x.author.includes("Aminov")));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
