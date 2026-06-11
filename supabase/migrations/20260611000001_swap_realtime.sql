-- Enable Realtime broadcast for the swaps table so clients can
-- react to status changes (pending → agreed → completed) without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE swaps;
