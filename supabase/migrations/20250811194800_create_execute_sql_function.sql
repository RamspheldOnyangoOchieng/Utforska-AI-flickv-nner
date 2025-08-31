CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('status', 'success');
END;
$$;