export const APPOINTMENT_SELECT = `
  SELECT a.id, a.scheduled_at, a.duration_minutes, a.status, a.visit_type, a.reason, a.doctor_notes,
         a.cancelled_by, a.created_at, a.updated_at,
         a.patient_id, pu.full_name AS patient_name, pu.id AS patient_user_id,
         a.doctor_id, du.full_name AS doctor_name, du.id AS doctor_user_id,
         d.clinic_name, d.city, s.name AS specialization, s.slug AS specialization_slug,
         (SELECT rv.rating FROM reviews rv WHERE rv.appointment_id = a.id) AS my_rating
    FROM appointments a
    JOIN patients p  ON p.id = a.patient_id
    JOIN users pu    ON pu.id = p.user_id
    JOIN doctors d   ON d.id = a.doctor_id
    JOIN users du    ON du.id = d.user_id
    JOIN specializations s ON s.id = d.specialization_id`;
