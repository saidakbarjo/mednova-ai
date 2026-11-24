-- ════════════════════════════════════════════════════════════════════
--  MEDNOVA AI — v2: patient reviews + multilingual notifications
-- ════════════════════════════════════════════════════════════════════

-- 11. reviews — one rating per completed appointment
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT CHECK (comment IS NULL OR char_length(comment) <= 600),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON reviews(doctor_id, created_at DESC);

-- Notifications store i18n keys + parameters (rendered in each reader's language)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS params JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('appointment', 'record', 'system', 'verification', 'review'));

-- Preferred interface language per user
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'uz'
  CHECK (locale IN ('uz', 'uz-old', 'ru', 'en'));
