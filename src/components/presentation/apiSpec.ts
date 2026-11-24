/** API catalogue for the presentation page. Descriptions are i18n keys: api.<id>. */
export type Endpoint = { id: string; method: "GET" | "POST" | "PUT" | "DELETE"; path: string; auth: string; body?: string };
export const API_GROUPS: { id: string; endpoints: Endpoint[] }[] = [
  { id: "auth", endpoints: [
    { id: "register", method: "POST", path: "/api/auth/register", auth: "public", body: `{ "full_name", "email", "password", "role", "specialization_id"? }` },
    { id: "login", method: "POST", path: "/api/auth/login", auth: "public", body: `{ "email", "password" }` },
    { id: "logout", method: "POST", path: "/api/auth/logout", auth: "any" },
    { id: "me", method: "GET", path: "/api/auth/me", auth: "signedIn" },
  ] },
  { id: "doctors", endpoints: [
    { id: "doctorsList", method: "GET", path: "/api/doctors", auth: "public" },
    { id: "doctorGet", method: "GET", path: "/api/doctors/:id", auth: "public" },
    { id: "doctorCreate", method: "POST", path: "/api/doctors", auth: "admin", body: `{ "full_name", "email", "password", "specialization_id", … }` },
    { id: "doctorUpdate", method: "PUT", path: "/api/doctors/:id", auth: "doctorAdmin", body: `{ "bio"?, "schedule"?: [...], "is_verified"? }` },
    { id: "slots", method: "GET", path: "/api/doctors/:id/slots?date=", auth: "public" },
    { id: "doctorReviews", method: "GET", path: "/api/doctors/:id/reviews", auth: "public" },
    { id: "doctorPatients", method: "GET", path: "/api/doctor/patients", auth: "doctor" },
  ] },
  { id: "appointments", endpoints: [
    { id: "apptList", method: "GET", path: "/api/appointments", auth: "signedIn" },
    { id: "apptCreate", method: "POST", path: "/api/appointments", auth: "patient", body: `{ "doctor_id", "scheduled_at", "reason", "visit_type" }` },
    { id: "apptUpdate", method: "PUT", path: "/api/appointments/:id", auth: "participant", body: `{ "status"?, "scheduled_at"?, "doctor_notes"? }` },
    { id: "apptDelete", method: "DELETE", path: "/api/appointments/:id", auth: "participant" },
    { id: "reviewCreate", method: "POST", path: "/api/reviews", auth: "patient", body: `{ "appointment_id", "rating": 1-5, "comment"? }` },
  ] },
  { id: "patients", endpoints: [
    { id: "profileGet", method: "GET", path: "/api/patients/profile", auth: "patient" },
    { id: "profilePut", method: "PUT", path: "/api/patients/profile", auth: "patient" },
    { id: "recordsGet", method: "GET", path: "/api/patients/records", auth: "patientDoctor" },
    { id: "recordsPost", method: "POST", path: "/api/patients/records", auth: "patientDoctor" },
  ] },
  { id: "ai", endpoints: [
    { id: "chat", method: "POST", path: "/api/ai/chat", auth: "signedIn", body: `{ "message", "conversation_id"? }` },
    { id: "symptom", method: "POST", path: "/api/ai/symptom-information", auth: "signedIn", body: `{ "symptoms": [...], "duration"?, "age_group"? }` },
    { id: "convList", method: "GET", path: "/api/ai/conversations", auth: "signedIn" },
    { id: "convGet", method: "GET", path: "/api/ai/conversations/:id", auth: "owner" },
  ] },
  { id: "admin", endpoints: [
    { id: "analytics", method: "GET", path: "/api/analytics/overview", auth: "signedIn" },
    { id: "users", method: "GET", path: "/api/admin/users", auth: "admin" },
    { id: "userPut", method: "PUT", path: "/api/admin/users/:id", auth: "admin" },
    { id: "notifications", method: "GET", path: "/api/notifications", auth: "signedIn" },
    { id: "specs", method: "GET", path: "/api/specializations", auth: "public" },
    { id: "health", method: "GET", path: "/api/health", auth: "public" },
  ] },
];
