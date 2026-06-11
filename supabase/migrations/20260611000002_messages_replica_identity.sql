-- REPLICA IDENTITY FULL is required for Supabase Realtime to reliably deliver
-- UPDATE events. Without it, the RLS check on the old row cannot be performed
-- (only the PK is logged in the WAL by default), so UPDATE events are silently
-- dropped for subscribers who depend on column-level filtering or RLS.
--
-- Impact: slightly more WAL data per row change on the messages table.
-- This is acceptable — messages are written once and updated (is_read) once.

ALTER TABLE messages REPLICA IDENTITY FULL;
