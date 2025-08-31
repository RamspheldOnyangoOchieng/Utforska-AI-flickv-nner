-- Function to get token usage statistics
CREATE OR REPLACE FUNCTION get_token_usage_stats(
  p_user_id UUID,
  p_interval TEXT DEFAULT '7 days',
  p_date_format TEXT DEFAULT 'Dy'
)
RETURNS TABLE (
  name TEXT,
  tokens BIGINT,
  images BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT 
      date_trunc('day', generate_series(
        current_date - (p_interval::interval),
        current_date,
        '1 day'::interval
      )) AS day
  ),
  token_usage AS (
    SELECT
      date_trunc('day', created_at) AS day,
      SUM(ABS(amount)) AS tokens
    FROM token_transactions
    WHERE 
      user_id = p_user_id
      AND type = 'usage'
      AND created_at >= current_date - (p_interval::interval)
    GROUP BY 1
  ),
  image_counts AS (
    SELECT
      date_trunc('day', created_at) AS day,
      COUNT(*) AS images
    FROM generated_images
    WHERE 
      user_id = p_user_id
      AND created_at >= current_date - (p_interval::interval)
    GROUP BY 1
  )
  SELECT
    to_char(ds.day, p_date_format) AS name,
    COALESCE(tu.tokens, 0) AS tokens,
    COALESCE(ic.images, 0) AS images
  FROM date_series ds
  LEFT JOIN token_usage tu ON ds.day = tu.day
  LEFT JOIN image_counts ic ON ds.day = ic.day
  ORDER BY ds.day;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_token_usage_stats TO authenticated;
