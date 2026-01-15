-- Create functions to increment impressions and clicks
CREATE OR REPLACE FUNCTION public.increment_sponsored_impressions(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sponsored_content
  SET impressions = impressions + 1
  WHERE id = content_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_sponsored_clicks(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sponsored_content
  SET clicks = clicks + 1
  WHERE id = content_id;
END;
$$;