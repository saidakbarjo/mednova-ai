-- ════════════════════════════════════════════════════════════════════
--  MEDNOVA AI — PostgreSQL schema  (works on Supabase, Postgres 14+, PGlite)
--  Authors: Saidakbar & Zukhra
-- ════════════════════════════════════════════════════════════════════

-- 1. users — every account (patient, doctor, admin)
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE CHECK (email = lower(email) AND position('@' in email) > 1),
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  role            TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. specializations — medical specialties catalogue
CREATE TABLE IF NOT EXISTS specializations (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT 'stethoscope',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. patients — 1:1 profile for users with role = patient
CREATE TABLE IF NOT EXISTS patients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth      DATE,
  gender             TEXT CHECK (gender IN ('female', 'male', 'other', 'prefer_not_to_say')),
  phone              TEXT,
  blood_type         TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  height_cm          NUMERIC(5,1) CHECK (height_cm IS NULL OR height_cm BETWEEN 40 AND 260),
  weight_kg          NUMERIC(5,1) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 2 AND 400),
  allergies          TEXT,
  chronic_conditions TEXT,
  emergency_contact  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. doctors — 1:1 profile for users with role = doctor
CREATE TABLE IF NOT EXISTS doctors (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization_id  INTEGER NOT NULL REFERENCES specializations(id) ON DELETE RESTRICT,
  title              TEXT NOT NULL DEFAULT 'MD',
  bio                TEXT NOT NULL DEFAULT '',
  years_experience   INTEGER NOT NULL DEFAULT 0 CHECK (years_experience BETWEEN 0 AND 70),
  consultation_fee   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (consultation_fee >= 0),
  clinic_name        TEXT NOT NULL DEFAULT '',
  city               TEXT NOT NULL DEFAULT '',
  languages          TEXT NOT NULL DEFAULT 'English',
  rating             NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count       INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  is_verified        BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization_id);
CREATE INDEX IF NOT EXISTS idx_doctors_verified ON doctors(is_verified);

-- 5. doctor_schedules — weekly working hours per doctor
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id      UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week    SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0 = Sunday
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  slot_minutes   SMALLINT NOT NULL DEFAULT 30 CHECK (slot_minutes IN (15, 20, 30, 45, 60)),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT schedule_time_order CHECK (end_time > start_time),
  CONSTRAINT schedule_one_per_day UNIQUE (doctor_id, day_of_week)
);

-- 6. appointments
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_minutes  SMALLINT NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 10 AND 180),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  visit_type        TEXT NOT NULL DEFAULT 'in_person' CHECK (visit_type IN ('in_person', 'video')),
  reason            TEXT NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  doctor_notes      TEXT,
  cancelled_by      TEXT CHECK (cancelled_by IN ('patient', 'doctor', 'admin')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor  ON appointments(doctor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status  ON appointments(status);
-- A doctor can never be double-booked for an active slot
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_active_slot
  ON appointments(doctor_id, scheduled_at) WHERE status IN ('pending', 'confirmed');

-- 7. medical_records
CREATE TABLE IF NOT EXISTS medical_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  record_type     TEXT NOT NULL CHECK (record_type IN ('visit_note', 'lab_result', 'vitals', 'vaccination', 'imaging')),
  title           TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  summary         TEXT NOT NULL DEFAULT '',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_records_patient ON medical_records(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_type ON medical_records(record_type);

-- 8. conversations — AI assistant chat threads
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'New conversation',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, updated_at DESC);

-- 9. messages — individual chat messages
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 8000),
  is_emergency     BOOLEAN NOT NULL DEFAULT FALSE,
  source           TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'demo', 'llm', 'safety')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- 10. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('appointment', 'record', 'system', 'verification')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Keep updated_at fresh automatically
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_patients_updated ON patients;
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_doctors_updated ON doctors;
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_appointments_updated ON appointments;
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
