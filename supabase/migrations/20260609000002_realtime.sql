-- Enable Realtime broadcast for the messages table so clients can
-- subscribe to new messages without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
