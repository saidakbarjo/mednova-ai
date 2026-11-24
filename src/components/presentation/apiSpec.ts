export type Endpoint = { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; auth: string; desc: string; body?: string };
export const API_GROUPS: { name: string; endpoints: Endpoint[] }[] = [
  { name: "Authentication", endpoints: [
    { method: "POST", path: "/api/auth/register", auth: "Public", desc: "Create a patient or doctor account; starts a session.", body: `{ "full_name", "email", "password", "role": "patient|doctor", "specialization_id"? }` },
    { method: "POST", path: "/api/auth/login", auth: "Public", desc: "Verify credentials (bcrypt) and set the httpOnly session cookie. Rate-limited.", body: `{ "email", "password" }` },
    { method: "POST", path: "/api/auth/logout", auth: "Any", desc: "Clear the session cookie." },
    { method: "GET", path: "/api/auth/me", auth: "Signed in", desc: "Current user, role and unread notification count." },
  ] },
  { name: "Doctors", endpoints: [
    { method: "GET", path: "/api/doctors", auth: "Public", desc: "Verified doctors. Filters: q, specialization, city. Admins: include_unverified=1." },
    { method: "GET", path: "/api/doctors/:id", auth: "Public", desc: "Doctor profile with weekly schedule and stats." },
    { method: "POST", path: "/api/doctors", auth: "Admin", desc: "Create a doctor account and profile.", body: `{ "full_name", "email", "password", "specialization_id", ... }` },
    { method: "PUT", path: "/api/doctors/:id", auth: "Doctor (own) · Admin", desc: "Update profile & schedule. Only admins may set is_verified.", body: `{ "bio"?, "schedule"?: [...], "is_verified"? }` },
    { method: "GET", path: "/api/doctors/:id/slots?date=", auth: "Public", desc: "Available booking slots for a date, from working hours minus active bookings." },
    { method: "GET", path: "/api/doctor/patients", auth: "Doctor", desc: "Patients the doctor has treated, with visit counts." },
  ] },
  { name: "Appointments", endpoints: [
    { method: "GET", path: "/api/appointments", auth: "Signed in", desc: "Role-scoped list. scope=upcoming|past|today, status, from, to." },
    { method: "POST", path: "/api/appointments", auth: "Patient", desc: "Book a slot. Validates working hours; a unique index prevents double booking.", body: `{ "doctor_id", "scheduled_at", "reason", "visit_type" }` },
    { method: "PUT", path: "/api/appointments/:id", auth: "Participant · Admin", desc: "Status transitions (role-checked), reschedule, doctor notes. Completing creates a visit record.", body: `{ "status"?, "scheduled_at"?, "doctor_notes"? }` },
    { method: "DELETE", path: "/api/appointments/:id", auth: "Participant · Admin", desc: "Patient/doctor: soft-cancel (audit trail kept). Admin: hard delete." },
  ] },
  { name: "Patients", endpoints: [
    { method: "GET", path: "/api/patients/profile", auth: "Patient", desc: "Own health profile." },
    { method: "PUT", path: "/api/patients/profile", auth: "Patient", desc: "Update profile (validated: blood type enum, ranges, phone format)." },
    { method: "GET", path: "/api/patients/records", auth: "Patient · Doctor", desc: "Patient: own records. Doctor: ?patient_id= of a treated patient only. Admin: denied." },
    { method: "POST", path: "/api/patients/records", auth: "Patient · Doctor", desc: "Patient logs vitals; doctor adds a clinical note for own patient." },
  ] },
  { name: "AI assistant", endpoints: [
    { method: "POST", path: "/api/ai/chat", auth: "Signed in", desc: "Safety layer → demo KB or LLM. Persists both messages in a conversation.", body: `{ "message", "conversation_id"? }` },
    { method: "POST", path: "/api/ai/symptom-information", auth: "Signed in", desc: "Structured educational info: urgency, specialists, questions. Never a diagnosis.", body: `{ "symptoms": [...], "duration"? }` },
    { method: "GET", path: "/api/ai/conversations", auth: "Signed in", desc: "Conversation history (own only) and AI mode." },
    { method: "GET", path: "/api/ai/conversations/:id", auth: "Owner", desc: "Messages of one conversation. DELETE removes it." },
  ] },
  { name: "Analytics & admin", endpoints: [
    { method: "GET", path: "/api/analytics/overview", auth: "Signed in", desc: "Role-aware statistics: platform (admin), practice (doctor), health (patient)." },
    { method: "GET", path: "/api/admin/users", auth: "Admin", desc: "Search and filter all accounts." },
    { method: "PUT", path: "/api/admin/users/:id", auth: "Admin", desc: "Activate / deactivate an account (takes effect immediately)." },
    { method: "GET", path: "/api/notifications", auth: "Signed in", desc: "Own notifications. PUT marks all as read." },
    { method: "GET", path: "/api/specializations", auth: "Public", desc: "Specialty catalogue with doctor counts." },
    { method: "GET", path: "/api/health", auth: "Public", desc: "Liveness check: database engine and AI mode." },
  ] },
];
