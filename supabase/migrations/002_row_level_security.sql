-- ════════════════════════════════════════════════════════════════════
--  MEDNOVA AI — Row Level Security (Supabase only)
--
--  Architecture decision: the browser NEVER talks to the database.
--  All reads/writes go through the Next.js REST API, which authenticates
--  the session and enforces role-based authorization in code
--  (src/lib/auth.ts + each route handler). The API connects with the
--  server-only DATABASE_URL.
--
--  Supabase, however, also exposes every table through its public
--  PostgREST endpoint using the "anon" key. To guarantee that medical data
--  can never leak through that side door, we enable RLS on every table and
--  grant NO policies to the public roles  →  deny by default.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners connecting through PostgREST
ALTER TABLE medical_records FORCE ROW LEVEL SECURITY;
ALTER TABLE messages        FORCE ROW LEVEL SECURITY;

-- Public catalogue data only: anyone may READ specializations.
DROP POLICY IF EXISTS "specializations are public" ON specializations;
CREATE POLICY "specializations are public" ON specializations
  FOR SELECT TO anon, authenticated USING (true);

-- Revoke direct table access from the public API roles entirely.
REVOKE ALL ON users, patients, doctors, doctor_schedules, appointments,
              medical_records, conversations, messages, notifications
       FROM anon, authenticated;

-- NOTE: The "postgres" role used by DATABASE_URL bypasses RLS (it owns the
-- tables), which is exactly what the trusted backend needs. medical_records
-- and messages use FORCE RLS, so we add an explicit backend policy for them:
DROP POLICY IF EXISTS "backend full access" ON medical_records;
CREATE POLICY "backend full access" ON medical_records TO postgres USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "backend full access" ON messages;
CREATE POLICY "backend full access" ON messages TO postgres USING (true) WITH CHECK (true);
