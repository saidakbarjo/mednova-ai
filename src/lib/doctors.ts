export const DOCTOR_SELECT = `
  SELECT d.id, d.user_id, u.full_name, u.email, u.is_active, d.title, d.bio, d.years_experience,
         d.consultation_fee::float AS consultation_fee, d.clinic_name, d.city, d.languages,
         d.rating::float AS rating, d.review_count, d.is_verified, d.verified_at, d.created_at,
         s.id AS specialization_id, s.name AS specialization, s.slug AS specialization_slug, s.icon AS specialization_icon
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    JOIN specializations s ON s.id = d.specialization_id`;

export const SCHEDULE_SELECT = `
  SELECT day_of_week, to_char(start_time, 'HH24:MI') AS start_time, to_char(end_time, 'HH24:MI') AS end_time,
         slot_minutes, is_active
    FROM doctor_schedules WHERE doctor_id = $1 ORDER BY day_of_week`;

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Local-time slot list for one date, given the schedule row for that weekday. */
export function buildSlots(date: string, start: string, end: string, step: number) {
  const out: Date[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  for (let mins = sh * 60 + sm; mins + step <= eh * 60 + em; mins += step) {
    out.push(new Date(`${date}T${pad(Math.floor(mins / 60))}:${pad(mins % 60)}:00`));
  }
  return out;
}
