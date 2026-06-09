-- Increment swap_count for both parties when a swap reaches 'completed'.
-- Fires on UPDATE so it only triggers when status actually changes.

CREATE OR REPLACE FUNCTION update_swap_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles SET swap_count = swap_count + 1 WHERE id = NEW.initiator_id;
    UPDATE profiles SET swap_count = swap_count + 1 WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_swap_completed
  AFTER UPDATE ON swaps
  FOR EACH ROW
  EXECUTE FUNCTION update_swap_count();
