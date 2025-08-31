CREATE OR REPLACE FUNCTION decrement_user_tokens(
  p_user_id UUID,
  p_tokens_to_decrement INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET tokens = tokens - p_tokens_to_decrement
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;