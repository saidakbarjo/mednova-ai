-- Supabase only (like 002): deny public API roles access to reviews.
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON reviews FROM anon, authenticated;
